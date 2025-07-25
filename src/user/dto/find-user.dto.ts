import { Pageable, Sort } from "src/common/types";

export class FindUserDto {
  search?: string;
  status?: number;
  deleteFlg?: number;
  pageable?: Pageable;
  sort?: Sort;
}
