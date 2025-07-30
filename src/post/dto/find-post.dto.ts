import { Pageable, Sort } from "src/common/types";

export class FindPostDto {
  search?: string;
  status?: number;
  deleteFlg?: number;
  pageable?: Pageable;
  sort?: Sort;
  excludePostSlug?: string;
  limitWords?: number;
  categorySlug?: string;
}
