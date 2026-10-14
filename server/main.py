"""
API de suivi du projet Re•Source : lit et modifie le fichier Excel de suivi
(actions, opérations, productions et leurs membres) pour l'onglet Suivi du site.

Lancement : `npm run dev` à la racine du projet (démarre le site ET cette API),
            ou seule : `npm run api`.
API        : http://localhost:8000/api/...   (proxifiée par Vite sous /api)
Swagger    : http://localhost:8000/docs

Fichier Excel utilisé, par ordre de priorité :
  1. variable d'environnement EXCEL_FILE_PATH ;
  2. clé "excel_file_path" de server/config.local.json (non versionné, voir config.example.json) ;
  3. server/suivi_projet.xlsx.
"""

import json, os, threading, openpyxl
from datetime import date
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

SERVER_DIR = Path(__file__).parent

def _excel_path():
    if os.getenv("EXCEL_FILE_PATH"):
        return os.getenv("EXCEL_FILE_PATH")
    config = SERVER_DIR / "config.local.json"
    if config.exists():
        path = json.loads(config.read_text(encoding="utf-8")).get("excel_file_path")
        if path: return path
    return str(SERVER_DIR / "suivi_projet.xlsx")

FILE_PATH = _excel_path()
_lock = threading.Lock()

app = FastAPI(title="API de suivi Re•Source", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
# Toutes les routes de données sont sous /api, pour ne pas entrer en collision avec
# les routes du site (proxy Vite : /api → ce serveur).
api = APIRouter(prefix="/api")

# ---------------------------------------------------------------------------
# Modèles
# ---------------------------------------------------------------------------
class MembreOperation(BaseModel):
    organisme: str
    statut: str = Field("PARTENAIRE CONTRIBUTEUR",
        description="PILOTE | CO-PILOTE | PARTENAIRE CONTRIBUTEUR | PARTENAIRE PARTICIPANT | PRESTATAIRE | PRESTATAIRE OU PARTENAIRE EXTERNE")

class NouvelleOperation(BaseModel):
    num_action: int; nom_op: str
    description: Optional[str] = None
    debut_op: Optional[date] = None; fin_op: Optional[date] = None
    etat_avancement: Optional[int] = Field(None, ge=0, le=5)
    membres: Optional[List[MembreOperation]] = None

class UpdateOperation(BaseModel):
    description: Optional[str] = None
    debut_op: Optional[date] = None; fin_op: Optional[date] = None
    etat_avancement: Optional[int] = Field(None, ge=0, le=5)
    membres: Optional[List[MembreOperation]] = None

class NouvelleProduction(BaseModel):
    id_op: str; nom_prod: str
    typologie: Optional[str] = None; description: Optional[str] = None
    debut_prod: Optional[date] = None; fin_prod: Optional[date] = None
    volume: Optional[int] = None; lieux: Optional[str] = None
    livrable_cdc: Optional[str] = "NON"; type_impact: Optional[str] = None
    nb_structures: Optional[int] = None; nb_beneficiaires: Optional[int] = None
    membres: Optional[List[str]] = None

class UpdateProduction(BaseModel):
    typologie: Optional[str] = None; description: Optional[str] = None
    debut_prod: Optional[date] = None; fin_prod: Optional[date] = None
    volume: Optional[int] = None; lieux: Optional[str] = None
    livrable_cdc: Optional[str] = None; type_impact: Optional[str] = None
    nb_structures: Optional[int] = None; nb_beneficiaires: Optional[int] = None
    membres: Optional[List[str]] = None

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def load_wb():
    if not os.path.exists(FILE_PATH):
        raise HTTPException(500, f"Fichier introuvable : '{FILE_PATH}'")
    return openpyxl.load_workbook(FILE_PATH)

def save_wb(wb): wb.save(FILE_PATH)

def to_serial(d):
    return None if d is None else (d - date(1899, 12, 30)).days

def _set_op_membres(wb, id_op, membres):
    ws = wb["OperationMembres"]
    autres = [list(r) for r in ws.iter_rows(min_row=2, values_only=True) if r and r[0] != id_op]
    ws.delete_rows(2, ws.max_row)
    for r in autres: ws.append(r)
    for m in membres: ws.append([id_op, m.organisme, m.statut])

def _set_prod_membres(wb, id_prod, membres):
    ws = wb["ProductionMembres"]
    autres = [list(r) for r in ws.iter_rows(min_row=2, values_only=True) if r and r[0] != id_prod]
    ws.delete_rows(2, ws.max_row)
    for r in autres: ws.append(r)
    for org in membres: ws.append([id_prod, org])

def _delete_rows_where(ws, col, keys):
    """Supprime les lignes (hors en-tête) dont la colonne `col` est dans `keys`. Retourne le nombre supprimé."""
    idx = [r[0].row for r in ws.iter_rows(min_row=2) if r[col].value in keys]
    for i in reversed(idx): ws.delete_rows(i)  # du bas vers le haut pour ne pas décaler les indices
    return len(idx)

# ---------------------------------------------------------------------------
# Endpoints lecture
# ---------------------------------------------------------------------------
@api.get("/info", tags=["Info"])
def info():
    exists = os.path.exists(FILE_PATH)
    return {"fichier": FILE_PATH, "accessible": exists,
            "taille_ko": round(os.path.getsize(FILE_PATH)/1024, 1) if exists else 0}

@api.get("/membres", tags=["Lecture"])
def lister_membres():
    """Retourne la liste de tous les organismes uniques (toutes feuilles membres)."""
    with _lock:
        wb = load_wb(); orgs = set()
        for sheet in ["ActionMembres", "OperationMembres", "ProductionMembres"]:
            try:
                for r in wb[sheet].iter_rows(min_row=2, values_only=True):
                    if r and r[1]: orgs.add(r[1])
            except KeyError: pass
        return sorted(orgs)

@api.get("/actions", tags=["Lecture"])
def lister_actions():
    with _lock:
        wb = load_wb()
        return [{"id": r[0], "nom": r[1]} for r in wb["Action"].iter_rows(min_row=2, values_only=True) if r[0]]

@api.get("/operations", tags=["Lecture"])
def lister_operations(num_action: Optional[int] = None):
    with _lock:
        wb = load_wb()
        return [{"num_action": r[0], "id_op": r[2], "etat": r[6]}
                for r in wb["Operation"].iter_rows(min_row=2, values_only=True)
                if r[0] and (num_action is None or r[0] == num_action)]

@api.get("/operations/{id_op}", tags=["Lecture"])
def get_operation(id_op: str):
    with _lock:
        wb = load_wb()
        row = next((r for r in wb["Operation"].iter_rows(min_row=2, values_only=True) if r[2] == id_op), None)
        if row is None: raise HTTPException(404, f"Opération '{id_op}' introuvable.")
        membres = [{"organisme": r[1], "statut": r[2]}
                   for r in wb["OperationMembres"].iter_rows(min_row=2, values_only=True) if r[0] == id_op]
        return {"num_action": row[0], "nom_op": row[1], "id_op": row[2],
                "description": row[3], "debut_op": row[4], "fin_op": row[5], "etat": row[6], "membres": membres}

@api.get("/productions", tags=["Lecture"])
def lister_productions(id_op: Optional[str] = None):
    with _lock:
        wb = load_wb()
        return [{"id_op": r[1], "id_prod": r[3], "typologie": r[4]}
                for r in wb["Production"].iter_rows(min_row=2, values_only=True)
                if r[0] and (id_op is None or r[1] == id_op)]

@api.get("/productions/{id_prod}", tags=["Lecture"])
def get_production(id_prod: str):
    with _lock:
        wb = load_wb()
        row = next((r for r in wb["Production"].iter_rows(min_row=2, values_only=True) if r[3] == id_prod), None)
        if row is None: raise HTTPException(404, f"Production '{id_prod}' introuvable.")
        membres = [r[1] for r in wb["ProductionMembres"].iter_rows(min_row=2, values_only=True) if r[0] == id_prod]
        return {"id_op": row[1], "nom_prod": row[2], "id_prod": row[3], "typologie": row[4],
                "description": row[5], "debut_prod": row[6], "fin_prod": row[7],
                "volume": row[8], "lieux": row[9], "livrable_cdc": row[10],
                "type_impact": row[11], "nb_structures": row[12], "nb_beneficiaires": row[13],
                "membres": membres}

# ---------------------------------------------------------------------------
# Endpoints écriture
# ---------------------------------------------------------------------------
@api.post("/operations", status_code=201, tags=["Écriture"])
def ajouter_operation(data: NouvelleOperation):
    with _lock:
        wb = load_wb()
        ids_actions = {r[0] for r in wb["Action"].iter_rows(min_row=2, values_only=True) if r[0]}
        if data.num_action not in ids_actions:
            raise HTTPException(404, f"Action {data.num_action} introuvable.")
        id_op = f"{data.num_action}-{data.nom_op}"
        if id_op in {r[2] for r in wb["Operation"].iter_rows(min_row=2, values_only=True) if r[2]}:
            raise HTTPException(409, f"L'opération '{id_op}' existe déjà.")
        wb["Operation"].append([data.num_action, data.nom_op, id_op, data.description,
            to_serial(data.debut_op), to_serial(data.fin_op), data.etat_avancement, to_serial(date.today())])
        if data.membres: _set_op_membres(wb, id_op, data.membres)
        save_wb(wb)
        
    return {"status": "créé", "id_op": id_op}

@api.patch("/operations/{id_op}", tags=["Écriture"])
def modifier_operation(id_op: str, data: UpdateOperation):
    with _lock:
        wb = load_wb()
        row = next((r for r in wb["Operation"].iter_rows(min_row=2) if r[2].value == id_op), None)
        if row is None: raise HTTPException(404, f"Opération '{id_op}' introuvable.")
        if data.description     is not None: row[3].value = data.description
        if data.debut_op        is not None: row[4].value = to_serial(data.debut_op)
        if data.fin_op          is not None: row[5].value = to_serial(data.fin_op)
        if data.etat_avancement is not None: row[6].value = data.etat_avancement
        row[7].value = to_serial(date.today())
        if data.membres is not None: _set_op_membres(wb, id_op, data.membres)
        save_wb(wb)
    return {"status": "modifié", "id_op": id_op}

@api.post("/productions", status_code=201, tags=["Écriture"])
def ajouter_production(data: NouvelleProduction):
    with _lock:
        wb = load_wb()
        op = next((r for r in wb["Operation"].iter_rows(min_row=2, values_only=True) if r[2] == data.id_op), None)
        if op is None: raise HTTPException(404, f"Opération '{data.id_op}' introuvable.")
        id_prod = f"{data.id_op}-{data.nom_prod}"
        if id_prod in {r[3] for r in wb["Production"].iter_rows(min_row=2, values_only=True) if r[3]}:
            raise HTTPException(409, f"La production '{id_prod}' existe déjà.")
        wb["Production"].append([op[0], data.id_op, data.nom_prod, id_prod, data.typologie,
            data.description, to_serial(data.debut_prod), to_serial(data.fin_prod),
            data.volume, data.lieux, data.livrable_cdc or "NON", data.type_impact,
            data.nb_structures, data.nb_beneficiaires])
        if data.membres: _set_prod_membres(wb, id_prod, data.membres)
        save_wb(wb)
    return {"status": "créé", "id_prod": id_prod}

@api.patch("/productions/{id_prod}", tags=["Écriture"])
def modifier_production(id_prod: str, data: UpdateProduction):
    with _lock:
        wb = load_wb()
        row = next((r for r in wb["Production"].iter_rows(min_row=2) if r[3].value == id_prod), None)
        if row is None: raise HTTPException(404, f"Production '{id_prod}' introuvable.")
        for field, col in {"typologie":4,"description":5,"livrable_cdc":10,"type_impact":11,"volume":8,"nb_structures":12,"nb_beneficiaires":13}.items():
            val = getattr(data, field)
            if val is not None: row[col].value = val
        if data.debut_prod is not None: row[6].value = to_serial(data.debut_prod)
        if data.fin_prod   is not None: row[7].value = to_serial(data.fin_prod)
        if data.lieux      is not None: row[9].value = data.lieux
        if data.membres is not None: _set_prod_membres(wb, id_prod, data.membres)
        save_wb(wb)
    return {"status": "modifié", "id_prod": id_prod}

# ---------------------------------------------------------------------------
# Endpoints suppression
# ---------------------------------------------------------------------------
@api.delete("/operations/{id_op}", tags=["Suppression"])
def supprimer_operation(id_op: str, cascade: bool = False):
    """Supprime une opération et ses membres. Si elle a des productions, refuse (409)
    sauf avec `cascade=true`, qui supprime aussi ses productions et leurs membres."""
    with _lock:
        wb = load_wb()
        if id_op not in {r[2] for r in wb["Operation"].iter_rows(min_row=2, values_only=True)}:
            raise HTTPException(404, f"Opération '{id_op}' introuvable.")
        prods = {r[3] for r in wb["Production"].iter_rows(min_row=2, values_only=True) if r[1] == id_op}
        if prods and not cascade:
            raise HTTPException(409, f"L'opération '{id_op}' a {len(prods)} production(s) rattachée(s). "
                                     "Relancer avec cascade=true pour tout supprimer.")
        _delete_rows_where(wb["Operation"], 2, {id_op})
        nb_mem = _delete_rows_where(wb["OperationMembres"], 0, {id_op})
        nb_prod = _delete_rows_where(wb["Production"], 1, {id_op}) if prods else 0
        nb_prod_mem = _delete_rows_where(wb["ProductionMembres"], 0, prods) if prods else 0
        save_wb(wb)
    return {"status": "supprimé", "id_op": id_op, "membres_supprimes": nb_mem,
            "productions_supprimees": nb_prod, "membres_productions_supprimes": nb_prod_mem}

@api.delete("/productions/{id_prod}", tags=["Suppression"])
def supprimer_production(id_prod: str):
    """Supprime une production et ses membres."""
    with _lock:
        wb = load_wb()
        if not _delete_rows_where(wb["Production"], 3, {id_prod}):
            raise HTTPException(404, f"Production '{id_prod}' introuvable.")
        nb_mem = _delete_rows_where(wb["ProductionMembres"], 0, {id_prod})
        save_wb(wb)
    return {"status": "supprimé", "id_prod": id_prod, "membres_supprimes": nb_mem}

app.include_router(api)


if __name__ == "__main__":
    import uvicorn
    print(f"\nFichier Excel : {os.path.abspath(FILE_PATH)}", flush=True)
    print("Swagger       : http://localhost:8000/docs\n", flush=True)
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True,
                app_dir=str(SERVER_DIR), reload_dirs=[str(SERVER_DIR)])
