"""Member 5 stress-test and immutable cell-detail API."""
from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.models.stress_test import StressCellDetail, StressTestRequest, StressTestRun
from app.services.stress_test import cell_detail, create_study, load_study

router = APIRouter()


def stored(action):
    try:
        return action()
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except (ValueError, KeyError, OSError) as error:
        raise HTTPException(status_code=503, detail='The saved study could not be verified. Please rerun the profile.') from error


@router.post('/stress-tests', response_model=StressTestRun, status_code=201)
def post_study(request: StressTestRequest):
    try:
        return create_study(request)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except OSError as error:
        raise HTTPException(status_code=503, detail='The study could not be saved. Retry when local storage is available.') from error


@router.get('/stress-tests/{run_id}', response_model=StressTestRun)
def get_study(run_id: UUID):
    return stored(lambda: load_study(str(run_id))[0])


@router.get('/stress-tests/{run_id}/cells/{cell_id}', response_model=StressCellDetail)
def get_cell(run_id: UUID, cell_id: str):
    return stored(lambda: cell_detail(str(run_id), cell_id))


@router.get('/stress-tests/{run_id}/export')
def export_study(run_id: UUID):
    def export():
        run, datasets = load_study(str(run_id))
        return {'format': 'helios-delay-study-v1', 'run': run.model_dump(mode='json'), 'datasets': datasets}
    return stored(export)
