# School P2 Backend

## Setup

1. **Install Poetry** (if not installed):
   ```bash
   pip install poetry
   ```

2. **Configure Virtual Environment**:
   ```bash
   poetry config virtualenvs.in-project true
   ```

3. **Install Dependencies**:
   ```bash
   poetry install
   ```

4. **Run Server**:
   ```bash
   poetry run python src/main.py
   ```
   Or directly with uvicorn:
   ```bash
   poetry run uvicorn src.main:app --reload
   ```

## Structure
- `src/main.py`: Entry point, app setup.
- `src/core/config.py`: Configuration settings.
- `src/core/security.py`: Security middleware/headers.
- `src/api`: Routes and endpoints.

## Deployment (Render)

This project is configured for [Render](https://render.com/).

1.  **Create Web Service**:
    - Build Command: `pip install -r requirements.txt`
    - Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
    - Environment Variables:
        - `PYTHON_VERSION`: `3.10.12` (recommended)

2.  **Keep-Alive**:
    - The server includes a background task (`src/main.py`) that pings the `RENDER_EXTERNAL_URL` every 30 seconds to prevent the free tier from spinning down.
    - Ensure `RENDER_EXTERNAL_URL` is available (Render provides this automatically).

## Security Features
- **FastAPI**: High performance, easy async.
- **Pydantic**: Data validation.
- **Secure Defaults**:
    - CORS configured.
    - Security headers enabled.
    - Rate limiting enabled.
