import traceback
from glob import glob
from typing import List

import uvicorn
from fastapi import FastAPI, HTTPException

app = FastAPI()

import os
from pathlib import Path

from PyPDF2 import PdfReader, PdfWriter
from pydantic import BaseModel


def get_original_file_name(original_file: str) -> str:
    basename = os.path.basename(original_file)
    # remove the file extension
    return os.path.splitext(basename)[0].replace("file:///", "")


def get_original_file_path(original_file: str) -> str:
    return original_file.replace("file:///", "")


def get_output_dir(output_dir: str) -> str:
    return output_dir.replace("file:///", "")


class SplitRequest(BaseModel):
    original_file: str
    page_number: int
    output_dir: str
    splits_so_far: int


class RemainderRequest(BaseModel):
    original_file: str
    output_dir: str


class RemainderResponse(BaseModel):
    remainder_file_path: str
    remainder_file_name: str
    split_files: List[str]

class SplitResponse(BaseModel):
    split_file_name: str
    remainder_file_name: str
    splits_so_far: int


class PdfSplitter:

    def get_or_create_remainder_file_path(self, request: RemainderRequest) -> RemainderResponse:
        original_file_name = get_original_file_name(request.original_file)
        original_file_path = get_original_file_path(request.original_file)
        split_files = self._get_split_files(request)
        remainder_file = f"{get_output_dir(request.output_dir)}{os.sep}{original_file_name}-remainder.pdf"
        if not os.path.exists(remainder_file):
            with open(original_file_path, 'rb') as file:
                with open(remainder_file, 'wb') as file2:
                    file2.write(file.read())
        return RemainderResponse(remainder_file_path=remainder_file,remainder_file_name= os.path.basename(remainder_file), split_files=split_files)

    def _get_new_pdf_file_path(self, request: SplitRequest) -> str:

        base_name = get_original_file_name(request.original_file)
        split_id = str(request.splits_so_far)
        sep = os.sep
        return f"{request.output_dir}{sep}{base_name}-split-{split_id}.pdf"

    def split_pdf(self, request: SplitRequest) -> SplitResponse:
        output_dir = request.output_dir
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        request.splits_so_far += 1
        response: RemainderResponse = self.get_or_create_remainder_file_path(
            RemainderRequest(original_file=request.original_file, output_dir=output_dir))
        remainder_file_path = response.remainder_file_path
        new_pdf_file_path = self._get_new_pdf_file_path(request)

        page_number = request.page_number
        with open(remainder_file_path, "rb") as rem:
            pdf_reader = PdfReader(rem)

            try:
                total_num_pages = len(pdf_reader.pages)
                assert page_number < total_num_pages
                new_pdf_writer = PdfWriter()
                remainder_writer = PdfWriter()

                for page in range(page_number):
                    # we add the pages from 0 to page_number
                    new_pdf_writer.add_page(pdf_reader.pages[page])

                for page in range(page_number, total_num_pages):
                    # we add the pages from page_number to the end to remainder_writer
                    remainder_writer.add_page(pdf_reader.pages[page])

                with open(new_pdf_file_path, 'wb') as file1:
                    new_pdf_writer.write(file1)

                with open(remainder_file_path, 'wb') as file2:
                    remainder_writer.write(file2)

                splitResponse = SplitResponse(split_file_name=os.path.basename(new_pdf_file_path),
                                         splits_so_far=request.splits_so_far,
                                         remainder_file_name=os.path.basename(remainder_file_path))
                return splitResponse


            except AssertionError as e:
                print("Error: The PDF you are cutting has less pages than you want to cut!")

    def _get_split_files(self, request: RemainderRequest) -> List[str]:
        # find all the files in the output directory with the following file name pattern f"{request.original_file}-split-*.pdf". Use glob for speed
        # return the number of files found
        files = glob(f"{request.output_dir}{os.sep}{get_original_file_name(request.original_file)}-split-*.pdf")
        files = list(map(lambda x: os.path.basename(x), files))

        if not files:
            files = []
        return files


@app.post("/split_pdf")
async def split_pdf(request: SplitRequest) -> SplitResponse:
    try:
        return PdfSplitter().split_pdf(request)
    except Exception as e:
        traceback.print_tb(e.__traceback__)
        raise HTTPException(status_code=400, detail=str(traceback.format_exception(e)))

@app.post("/remainder_file_path")
async def remainder_file_path(request: RemainderRequest) -> RemainderResponse:
    try:
        return PdfSplitter().get_or_create_remainder_file_path(request)
    except Exception as e:
        traceback.print_tb(e.__traceback__)
        raise HTTPException(status_code=400, detail=str(traceback.format_exception(e)))

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8090)
