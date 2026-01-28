/**
 * Contains the unique identifier of the item and properties necessary for
 * selective harvesting.
 */
export type OaiPmhHeader = {
  /**
   * Indicates the withdrawal of availability of the specified metadata format
   * for the item, dependent on the repository support for
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#deletion | deletions}.
   */
  isDeleted: boolean;
  /**
   * The
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#UniqueIdentifier | unique identifier}
   * of an item in a repository
   */
  identifier: string;
  /**
   * The
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Datestamp | datestamp}
   * of creation, modification or deletion of the record for the purpose of
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#SelectiveHarvestingandSets | selective harvesting}.
   */
  datestamp: string;
  /**
   * Optional
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Set | set}
   * elements. Set membership of the item for the purpose of
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#SelectiveHarvestingandSets | selective harvesting}.
   */
  setSpec?: string[];
};
