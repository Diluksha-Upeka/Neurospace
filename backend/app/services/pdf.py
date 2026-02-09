from __future__ import annotations

import os

from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from ..schemas import DocumentChunk, PDFResult


# Class does 2 main things:
# 1) Extract text from each page of the PDF using PyPDF2.
# 2) Split the extracted text into smaller chunks using LangChain's RecursiveCharacterTextSplitter.
class PDFProcessor:
    def __init__(self):
        # Chunk the text into manageable pieces for embedding
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            is_separator_regex=False,
        )

    def process_pdf(self, pdf_path: str) -> PDFResult:
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        print(f"Processing PDF: {pdf_path}...")
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)

        all_chunks: list[DocumentChunk] = []
        global_chunk_index = 0

        for page_num, page in enumerate(reader.pages):
            raw_text = page.extract_text() or ""
            raw_text = raw_text.strip()
            if not raw_text:
                continue

            text_chunks = self.splitter.split_text(raw_text)
            for chunk_text in text_chunks:
                all_chunks.append(
                    DocumentChunk(
                        text=chunk_text,
                        page_number=page_num + 1,
                        chunk_index=global_chunk_index,
                        metadata={"source": os.path.basename(pdf_path)},
                    )
                )
                global_chunk_index += 1

        print(f"Extracted {len(all_chunks)} chunks from {total_pages} pages.")
        return PDFResult(
            filename=os.path.basename(pdf_path),
            total_pages=total_pages,
            chunks=all_chunks,
        )


# Singleton instance
pdf_processor = PDFProcessor()
