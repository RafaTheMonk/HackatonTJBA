from __future__ import annotations

import re
from pathlib import Path
from typing import List
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

INLINE_CODE_PATTERN = re.compile(r"`([^`]+)`")
BOLD_PATTERN = re.compile(r"\*\*([^*]+)\*\*")
ITALIC_PATTERN = re.compile(r"(?<!\*)\*([^*]+)\*(?!\*)")


def convert_inline(text: str) -> str:
    """Converte marcações simples de Markdown em tags compatíveis com o Paragraph."""

    def repl_code(match: re.Match[str]) -> str:
        return f"<font face=\"Courier\">{escape(match.group(1))}</font>"

    def repl_bold(match: re.Match[str]) -> str:
        return f"<b>{escape(match.group(1))}</b>"

    def repl_italic(match: re.Match[str]) -> str:
        return f"<i>{escape(match.group(1))}</i>"

    text = text.strip()
    text = INLINE_CODE_PATTERN.sub(repl_code, text)
    text = BOLD_PATTERN.sub(repl_bold, text)
    text = ITALIC_PATTERN.sub(repl_italic, text)
    text = escape(text)
    # Corrige tags escapadas
    text = text.replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")
    text = text.replace("&lt;i&gt;", "<i>").replace("&lt;/i&gt;", "</i>")
    text = text.replace('&lt;font face="Courier"&gt;', '<font face="Courier">')
    text = text.replace("&lt;/font&gt;", "</font>")
    return text


def build_story(lines: List[str]) -> List:
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Heading1Custom", parent=styles["Heading1"], leading=24, spaceAfter=12))
    styles.add(ParagraphStyle(name="Heading2Custom", parent=styles["Heading2"], leading=20, spaceAfter=10))
    styles.add(ParagraphStyle(name="Heading3Custom", parent=styles["Heading3"], leading=18, spaceAfter=8))
    styles.add(ParagraphStyle(name="Body", parent=styles["BodyText"], leading=14, spaceAfter=8))
    styles.add(ParagraphStyle(name="BlockQuote", parent=styles["Body"], leftIndent=18, textColor=colors.HexColor("#444444"), fontSize=11, spaceBefore=4, spaceAfter=8))

    story = []
    list_buffer: List[str] = []
    ordered_list_buffer: List[str] = []
    table_buffer: List[str] = []
    is_in_table = False

    def flush_unordered_list() -> None:
        nonlocal list_buffer
        if not list_buffer:
            return
        items = [ListItem(Paragraph(convert_inline(item), styles["Body"]), leftIndent=12) for item in list_buffer]
        story.append(ListFlowable(items, bulletType="bullet", start="bullet", leftIndent=18, bulletFontName="Helvetica", bulletFontSize=9))
        story.append(Spacer(1, 8))
        list_buffer = []

    def flush_ordered_list() -> None:
        nonlocal ordered_list_buffer
        if not ordered_list_buffer:
            return
        items = [ListItem(Paragraph(convert_inline(item), styles["Body"]), value=index + 1, leftIndent=12) for index, item in enumerate(ordered_list_buffer)]
        story.append(ListFlowable(items, bulletType="1", leftIndent=18, bulletFontName="Helvetica", bulletFontSize=9))
        story.append(Spacer(1, 8))
        ordered_list_buffer = []

    def flush_table() -> None:
        nonlocal table_buffer, is_in_table
        if not table_buffer:
            return
        rows = [
            [cell.strip() for cell in row.strip().strip("|").split("|")]
            for row in table_buffer
            if row.strip()
        ]
        if len(rows) >= 2 and set(rows[1]) <= {"---", "---".ljust(3, "-"), "-", " :", ": ", " : ", ":-", "-:", ":-:", " : "}:
            header = rows[0]
            data = [header] + rows[2:]
        else:
            data = rows
        table = Table(data, hAlign='LEFT', colWidths=[None] * len(data[0]))
        table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F0F3F5")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#001C40")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#B0BEC5")),
            ])
        )
        story.append(table)
        story.append(Spacer(1, 12))
        table_buffer = []
        is_in_table = False

    for raw_line in lines:
        line = raw_line.rstrip("\n")

        if not line.strip():
            flush_unordered_list()
            flush_ordered_list()
            flush_table()
            continue

        if line.startswith("---") and set(line.strip()) == {"-"}:
            flush_unordered_list()
            flush_ordered_list()
            flush_table()
            story.append(Spacer(1, 12))
            continue

        if line.startswith("# "):
            flush_unordered_list()
            flush_ordered_list()
            flush_table()
            story.append(Paragraph(convert_inline(line[2:]), styles["Heading1Custom"]))
            story.append(Spacer(1, 12))
            continue

        if line.startswith("## "):
            flush_unordered_list()
            flush_ordered_list()
            flush_table()
            story.append(Paragraph(convert_inline(line[3:]), styles["Heading2Custom"]))
            continue

        if line.startswith("### "):
            flush_unordered_list()
            flush_ordered_list()
            flush_table()
            story.append(Paragraph(convert_inline(line[4:]), styles["Heading3Custom"]))
            continue

        if line.strip().startswith(">"):
            flush_table()
            text = line.strip().lstrip(">").strip()
            story.append(Paragraph(convert_inline(text), styles["BlockQuote"]))
            continue

        match_bullet = re.match(r"[-*] +(.+)", line.strip())
        if match_bullet:
            flush_ordered_list()
            flush_table()
            list_buffer.append(match_bullet.group(1).strip())
            continue

        match_ordered = re.match(r"\d+[.)] +(.+)", line.strip())
        if match_ordered:
            flush_unordered_list()
            flush_table()
            ordered_list_buffer.append(match_ordered.group(1).strip())
            continue

        if "|" in line:
            flush_unordered_list()
            flush_ordered_list()
            table_buffer.append(line)
            is_in_table = True
            continue

        # Se chegamos aqui e existe tabela em andamento, finalizamos
        if is_in_table:
            flush_table()

        if line.strip().lower() == "pagebreak":
            story.append(PageBreak())
            continue

        story.append(Paragraph(convert_inline(line), styles["Body"]))

    flush_unordered_list()
    flush_ordered_list()
    flush_table()

    return story


def generate_pdf(markdown_path: Path, output_path: Path) -> None:
    lines = markdown_path.read_text(encoding="utf-8").splitlines()
    story = build_story(lines)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="Relatório Técnico e Financeiro — Migração Justina AI",
        author="Equipe Bit Bashing",
    )
    doc.build(story)


if __name__ == "__main__":
    md_path = Path("docs/Relatorio_Migracao_Justina.md")
    pdf_path = Path("docs/Relatorio_Migracao_Justina.pdf")
    generate_pdf(md_path, pdf_path)
    print(f"PDF gerado em: {pdf_path}")
