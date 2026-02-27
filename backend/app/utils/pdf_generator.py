from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import A4

def create_pdf_from_text(text: str, output_path: str) -> str:
    """
    Generate a PDF file from plain text.

    Args:
        text (str): The text content to write into the PDF.
        output_path (str): Full file path where the PDF will be saved.

    Returns:
        str: Path to the generated PDF file.
    """

    # Create document
    doc = SimpleDocTemplate(output_path, pagesize=A4)
    elements = []

    # Load default styles
    styles = getSampleStyleSheet()
    normal_style = styles["Normal"]

    # Split text into paragraphs using blank lines
    paragraphs = text.split("\n\n")

    for para in paragraphs:
        cleaned = para.strip().replace("\n", "<br/>")
        if cleaned:
            elements.append(Paragraph(cleaned, normal_style))
            elements.append(Spacer(1, 0.2 * inch))

    # Build the PDF
    doc.build(elements)

    return output_path