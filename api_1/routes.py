from fastapi import APIRouter, HTTPException, UploadFile, File
from utils import write_extratos, write_comprovantes
from core.manager import Manager
from typing import List, Optional


Core = Manager()
router = APIRouter()


@router.post("/carregar", summary="Carregar dados (comprovantes e extratos)")
async def carregar(
    comprovantes: List[UploadFile] = File(...),
    corpx: Optional[UploadFile] = File(None),
    itau: Optional[UploadFile] = File(None),
    digital: Optional[UploadFile] = File(None),
    generico: Optional[UploadFile] = File(None),
):
    try:
        extratos = await write_extratos(corpx, itau, digital, generico)
        comprovantes = await write_comprovantes(comprovantes)

        Core.carregar(comprovantes, **extratos)

        result = Core.validar()

        Core.clear()

        return result
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
