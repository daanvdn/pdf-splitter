export interface SplitRequest {
    original_file: string;
    page_number: number;
    output_dir: string;
    splits_so_far: number;
}

export interface RemainderRequest {
    original_file: string;
    output_dir: string;
}
export interface SplitResponse {
    splits_so_far: number;
    split_file_name: string
    remainder_file_name: string

}