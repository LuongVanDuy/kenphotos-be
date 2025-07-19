import { Pageable, Sort } from "src/common/types";

export class FindPostDto {
  search?: string;
  status?: number;
  pageable?: Pageable;
  sort?: Sort;
}
