import { Pageable, Sort } from "src/common/types";

export class FindUserDto {
  search?: string;
  status?: number;
  pageable?: Pageable;
  sort?: Sort;
}
