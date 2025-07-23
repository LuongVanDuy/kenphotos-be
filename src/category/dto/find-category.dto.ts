import { Pageable, Sort } from "src/common/types";

export class FindCategoryDto {
  search?: string;
  pageable?: Pageable;
  sort?: Sort;
}
