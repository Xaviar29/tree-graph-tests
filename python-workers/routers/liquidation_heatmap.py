from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
from scipy.stats import gaussian_kde

router = APIRouter()

class HeatmapRequest(BaseModel):
    liquidations: list[dict]
    grid_size: int = 50
    price_min: float | None = None
    price_max: float | None = None

class HeatmapResponse(BaseModel):
    grid: list[list[float]]
    price_bins: list[float]
    notional_bins: list[float]

@router.post("/heatmap", response_model=HeatmapResponse)
async def compute_heatmap(req: HeatmapRequest):
    if len(req.liquidations) < 5:
        raise HTTPException(status_code=400, detail="Need at least 5 liquidations")

    prices = np.array([l["price"] for l in req.liquidations])
    notionals = np.array([l["notional"] for l in req.liquidations])

    if req.price_min is not None and req.price_max is not None:
        p_min, p_max = req.price_min, req.price_max
    else:
        p_min, p_max = prices.min() * 0.98, prices.max() * 1.02

    n_min, n_max = 0, notionals.max() * 1.1
    if n_max == 0:
        n_max = 1.0

    grid_size = min(req.grid_size, 100)
    price_bins = np.linspace(p_min, p_max, grid_size)
    notional_bins = np.linspace(n_min, n_max, grid_size)

    try:
        if len(prices) >= 10 and np.std(prices) > 0 and np.std(notionals) > 0:
            data = np.vstack([prices, notionals])
            kde = gaussian_kde(data, bw_method=0.3)
            xi, yi = np.meshgrid(price_bins, notional_bins)
            positions = np.vstack([xi.ravel(), yi.ravel()])
            density = kde(positions).reshape(grid_size, grid_size)
            density = density / density.max()
        else:
            density = np.zeros((grid_size, grid_size))
            for l in req.liquidations:
                xi = int(np.interp(l["price"], [p_min, p_max], [0, grid_size - 1]))
                yi = int(np.interp(l["notional"], [n_min, n_max], [0, grid_size - 1]))
                density[yi, xi] += l["notional"]
            if density.max() > 0:
                density = density / density.max()
    except Exception:
        density = np.zeros((grid_size, grid_size))

    return HeatmapResponse(
        grid=density.tolist(),
        price_bins=price_bins.tolist(),
        notional_bins=notional_bins.tolist(),
    )
