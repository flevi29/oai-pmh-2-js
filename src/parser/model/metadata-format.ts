/**
 * OAI-PMH supports the dissemination of records in multiple metadata formats
 * from a repository. The
 * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListMetadataFormats | ListMetadataFormats}
 * request returns the list of all metadata formats available from a
 * repository.
 */
export type OaiPmhMetadataFormat = {
  /**
   * A string to specify the metadata format in OAI-PMH requests issued to the
   * repository. metadataPrefix consists of any valid
   * {@link http://www.ietf.org/rfc/rfc2396.txt | URI unreserved characters}.
   * `metadataPrefix` arguments are used in
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListRecords | ListRecords},
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListIdentifiers | ListIdentifiers},
   * and
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#GetRecord | GetRecord}
   * requests to retrieve records, or the headers of records that include
   * metadata in the format specified by the metadataPrefix
   */
  metadataPrefix: string;
  /**
   * The URL of an {@link http://www.w3.org/XML/Schema | XML schema} to test
   * validity of metadata expressed according to the format
   */
  schema: string;
  /**
   * The
   * {@link http://www.w3.org/TR/1999/REC-xml-names-19990114/Overview.html | XML namespace}
   * URI that is a global identifier of the metadata format.
   */
  metadataNamespace: string;
};
