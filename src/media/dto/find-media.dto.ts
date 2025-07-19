import { Pageable, Sort } from "src/common/types";

export class FindMediaDto {
  search?: string;
  status?: number;
  pageable?: Pageable;
  sort?: Sort;
}
