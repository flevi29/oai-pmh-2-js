import type { ParsedXMLElement } from "./xml.ts";

/**
 * A set is an optional construct for grouping items for the purpose of
 * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#SelectiveHarvestingandSets | selective harvesting}.
 * Repositories may organize items into sets. Set organization may be flat, i.e.
 * a simple list, or hierarchical. Multiple hierarchies with distinct,
 * independent top-level nodes are allowed. Hierarchical organization of sets is
 * expressed in the syntax of the setSpec parameter as described below. When a
 * repository defines a set organization it must include set membership
 * information in the
 * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#header | headers}
 * of items returned in response to the
 * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListIdentifiers | ListIdentifiers}
 * ,
 * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListRecords | ListRecords}
 * and
 * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#GetRecord | GetRecord}
 * requests.
 *
 * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Set}
 */
export type OaiPmhSet = {
  /**
   * A colon [:] separated list indicating the path from the root of the set
   * hierarchy to the respective node. Each element in the list is a string
   * consisting of any valid
   * {@link http://www.ietf.org/rfc/rfc2396.txt | URI unreserved characters},
   * which must not contain any colons [:]. Since a setSpec forms a unique
   * identifier for the set within the repository, it must be unique for each
   * set. Flat set organizations have only sets with setSpec that do not contain
   * any colons [:].
   */
  setSpec: string;
  /** A short human-readable string naming the set. */
  setName: string;
  /**
   * An optional and repeatable container that may hold community-specific
   * XML-encoded data about the set; the accompanying
   * {@link http://www.openarchives.org/OAI/2.0/guidelines.htm | Implementation Guidelines}
   * document provides suggestions regarding the usage of this container.
   */
  setDescription?: ParsedXMLElement[];
};
