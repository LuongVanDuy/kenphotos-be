import { Pageable, Sort } from "src/common/types";

export class FindOrderDto {
  search?: string;
  status?: number;
  deleteFlg?: number;
  pageable?: Pageable;
  sort?: Sort;
}
