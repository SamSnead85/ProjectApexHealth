"""
Document Intelligence API Router
OCR processing, document classification, and structured data extraction
for healthcare documents (CMS-1500, UB-04, EOBs, medical records, etc.).
"""

import structlog
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.config import settings

logger = structlog.get_logger()
router = APIRouter()


class DocumentClassification(BaseModel):
    category: str
    confidence: float
    subcategory: Optional[str] = None


class ExtractedField(BaseModel):
    field_name: str
    value: str
    confidence: float
    bounding_box: Optional[dict] = None
    page_number: int = 1


class DocumentAnalysisResult(BaseModel):
    document_id: str
    classification: DocumentClassification
    extracted_fields: list[ExtractedField]
    ocr_text: str
    page_count: int
    processing_time_ms: int
    contains_phi: bool
    phi_fields: list[str] = []
    suggested_actions: list[str] = []


class CMS1500ExtractionResult(BaseModel):
    """Structured data extracted from a CMS-1500 claim form."""
    patient_name: Optional[str] = None
    patient_dob: Optional[str] = None
    patient_gender: Optional[str] = None
    patient_address: Optional[str] = None
    insured_name: Optional[str] = None
    insured_id: Optional[str] = None
    group_number: Optional[str] = None
    payer_name: Optional[str] = None
    payer_id: Optional[str] = None
    referring_provider: Optional[str] = None
    referring_npi: Optional[str] = None
    billing_provider: Optional[str] = None
    billing_npi: Optional[str] = None
    billing_tax_id: Optional[str] = None
    facility_name: Optional[str] = None
    diagnosis_codes: list[str] = []
    service_lines: list[dict] = []
    total_charge: Optional[float] = None
    patient_signature: bool = False
    provider_signature: bool = False
    date_of_service: Optional[str] = None
    place_of_service: Optional[str] = None


# Healthcare document types and their expected fields
DOCUMENT_SCHEMAS = {
    "cms_1500": {
        "name": "CMS-1500 Professional Claim",
        "fields": [
            "patient_name", "patient_dob", "insured_id", "group_number",
            "diagnosis_codes", "procedure_codes", "charges", "provider_npi",
            "place_of_service", "date_of_service",
        ],
    },
    "ub_04": {
        "name": "UB-04 Institutional Claim",
        "fields": [
            "patient_name", "patient_dob", "admission_date", "discharge_date",
            "revenue_codes", "diagnosis_codes", "procedure_codes", "charges",
            "provider_npi", "facility_name",
        ],
    },
    "eob": {
        "name": "Explanation of Benefits",
        "fields": [
            "patient_name", "claim_number", "service_date", "provider_name",
            "charged_amount", "allowed_amount", "paid_amount", "patient_responsibility",
            "adjustment_codes", "check_number",
        ],
    },
    "medical_record": {
        "name": "Medical Record / Clinical Note",
        "fields": [
            "patient_name", "date_of_service", "provider_name", "chief_complaint",
            "assessment", "plan", "diagnosis_codes", "medications", "vital_signs",
        ],
    },
    "lab_result": {
        "name": "Laboratory Results",
        "fields": [
            "patient_name", "order_date", "result_date", "ordering_provider",
            "test_name", "result_value", "reference_range", "abnormal_flag",
        ],
    },
    "prior_auth_form": {
        "name": "Prior Authorization Request Form",
        "fields": [
            "patient_name", "member_id", "diagnosis_codes", "procedure_codes",
            "requesting_provider", "clinical_notes", "urgency",
        ],
    },
    "id_card": {
        "name": "Insurance ID Card",
        "fields": [
            "member_name", "member_id", "group_number", "plan_name",
            "payer_name", "copay_amounts", "effective_date",
        ],
    },
}


@router.post("/analyze", response_model=DocumentAnalysisResult)
async def analyze_document(
    file: UploadFile = File(...),
    organization_id: str = "",
    document_type_hint: Optional[str] = None,
):
    """
    Analyze a healthcare document using AI.
    
    Performs:
    1. **OCR** - Text extraction from images/PDFs
    2. **Classification** - Identify document type (CMS-1500, UB-04, EOB, etc.)
    3. **Data Extraction** - Extract structured fields based on document type
    4. **PHI Detection** - Identify and flag Protected Health Information
    5. **Action Suggestions** - Recommend next steps (create claim, verify eligibility, etc.)
    """
    start_time = datetime.utcnow()

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Read file content
    content = await file.read()
    file_size = len(content)

    logger.info(
        "Analyzing document",
        filename=file.filename,
        size=file_size,
        content_type=file.content_type,
    )

    # Simulated AI analysis (replace with actual Gemini Vision API call)
    # In production: send to Gemini 2.0 with vision capabilities
    doc_type = document_type_hint or "cms_1500"
    schema = DOCUMENT_SCHEMAS.get(doc_type, DOCUMENT_SCHEMAS["cms_1500"])

    extracted_fields = []
    for field in schema["fields"]:
        extracted_fields.append(ExtractedField(
            field_name=field,
            value=f"[Extracted from {file.filename}]",
            confidence=0.85,
            page_number=1,
        ))

    phi_fields = ["patient_name", "patient_dob", "insured_id", "member_id", "ssn"]
    detected_phi = [f for f in schema["fields"] if f in phi_fields]

    suggested_actions = []
    if doc_type == "cms_1500":
        suggested_actions = [
            "Create professional claim from extracted data",
            "Verify member eligibility",
            "Check prior authorization requirements",
        ]
    elif doc_type == "eob":
        suggested_actions = [
            "Reconcile with existing claim",
            "Update payment records",
            "Generate member statement",
        ]
    elif doc_type == "prior_auth_form":
        suggested_actions = [
            "Create prior authorization request",
            "Check clinical criteria",
            "Route to medical director review",
        ]

    elapsed_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

    return DocumentAnalysisResult(
        document_id=f"doc-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        classification=DocumentClassification(
            category=doc_type,
            confidence=0.92,
            subcategory=schema["name"],
        ),
        extracted_fields=extracted_fields,
        ocr_text=f"[OCR text extracted from {file.filename} - {file_size} bytes]",
        page_count=1,
        processing_time_ms=elapsed_ms,
        contains_phi=len(detected_phi) > 0,
        phi_fields=detected_phi,
        suggested_actions=suggested_actions,
    )


@router.post("/extract/cms1500", response_model=CMS1500ExtractionResult)
async def extract_cms1500(file: UploadFile = File(...)):
    """Extract structured data from a CMS-1500 claim form image/PDF."""
    content = await file.read()

    # In production: use Gemini Vision API for form extraction
    return CMS1500ExtractionResult(
        patient_name="[Extracted from form]",
        patient_dob="[Extracted from form]",
        insured_id="[Extracted from form]",
        diagnosis_codes=["M54.5", "G89.29"],
        service_lines=[
            {
                "procedure_code": "99213",
                "modifier": "",
                "diagnosis_pointer": "1",
                "charges": 150.00,
                "units": 1,
                "date_of_service": "2024-01-15",
            }
        ],
        total_charge=150.00,
    )


@router.post("/classify")
async def classify_document(file: UploadFile = File(...)):
    """Classify a document without full extraction."""
    content = await file.read()

    return {
        "classification": "cms_1500",
        "confidence": 0.94,
        "alternatives": [
            {"category": "medical_record", "confidence": 0.04},
            {"category": "other", "confidence": 0.02},
        ],
    }


@router.post("/suggest-codes")
async def suggest_medical_codes(clinical_text: str = ""):
    """
    Suggest ICD-10 and CPT codes from clinical text.
    Uses AI to analyze clinical documentation and recommend codes.
    """
    if not clinical_text:
        raise HTTPException(status_code=400, detail="Clinical text is required")

    # In production: use Gemini to analyze clinical text
    return {
        "icd10_suggestions": [
            {"code": "M54.5", "description": "Low back pain", "confidence": 0.95},
            {"code": "M54.2", "description": "Cervicalgia", "confidence": 0.72},
        ],
        "cpt_suggestions": [
            {"code": "99213", "description": "Office visit, established, low", "confidence": 0.88},
            {"code": "97110", "description": "Therapeutic exercises", "confidence": 0.65},
        ],
        "clinical_notes": "Based on documented symptoms and examination findings.",
    }


@router.get("/schemas")
async def list_document_schemas():
    """List supported document types and their expected fields."""
    return {"schemas": DOCUMENT_SCHEMAS}
