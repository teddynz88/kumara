"""PDF text extraction via pdfplumber. No OCR — scanned PDFs get a clear error."""

import io

import pdfplumber

SCANNED_PDF_ERROR = (
    "This PDF doesn't have readable text. Try a text-based PDF, "
    "or enter the recipe manually."
)


class NoTextLayer(Exception):
    pass


def extract_pdf_text(data: bytes, max_pages: int = 40) -> str:
    try:
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages[:max_pages]]
    except Exception as exc:  # corrupt / not actually a PDF
        raise NoTextLayer(SCANNED_PDF_ERROR) from exc

    text = "\n\n".join(p for p in pages if p.strip()).strip()
    if len(text) < 50:
        raise NoTextLayer(SCANNED_PDF_ERROR)
    return text
