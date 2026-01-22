import type { ListOptions } from "./oai-pmh.ts";

type ListVerbOptions = { verb: "ListIdentifiers" | "ListRecords" | "ListSets" };
export type ListOptionsWithVerb = ListVerbOptions & Partial<ListOptions>;
export type ListContinuationParams = ListVerbOptions & {
  resumptionToken: string;
};

export type OaiPmhListResponse<T> = {
  records: T[];
  resumptionToken: string | null;
};
