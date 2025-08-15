import { Pageable, Sort } from "src/common/types";

export class FindServiceDto {
  search?: string;
  category?: number;
  status?: number;
  deleteFlg?: number;
  pageable?: Pageable;
  sort?: Sort;
  limitWords?: number;
}
