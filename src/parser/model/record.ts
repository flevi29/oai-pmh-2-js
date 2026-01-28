import type { OaiPmhHeader } from "./header.ts";
import type { ParsedXMLElement } from "./xml.ts";

/**
 * A record is metadata expressed in a single format. A record is identified
 * unambiguously by the combination of the
 * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#UniqueIdentifier | unique identifier}
 * of the item from which the record is available, the metadataPrefix
 * identifying the metadata format of the record, and the
 * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Datestamp | datestamp}
 * of the record.
 *
 * @see {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#Record}
 */
export type OaiPmhRecord = {
  /**
   * Contains the unique identifier of the item and properties necessary for
   * selective harvesting.
   */
  header: OaiPmhHeader;
  /**
   * A single manifestation of the metadata from an item. The OAI-PMH supports
   * items with multiple manifestations (formats) of metadata. At a minimum,
   * repositories must be able to return records with metadata expressed in the
   * {@link http://purl.org/DC/documents/rec-dces-19990702.htm | Dublin Core}
   * format, without any
   * {@link http://purl.org/DC/documents/rec/dcmes-qualifiers-20000711.htm | qualification}.
   * Optionally, a repository may also disseminate other formats of metadata.
   * The specific metadata format of the record to be disseminated is specified
   * by means of an argument -- the
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#MetadataNamespaces | metadataPrefix}
   * -- in the
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#GetRecord | GetRecord}
   * or
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListRecords | ListRecords}
   * request that produces the record. The
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListMetadataFormats | ListMetadataFormats}
   * request returns the list of all metadata formats available from a
   * repository, or for a specific item (which can be specified as an argument
   * to the
   * {@link https://www.openarchives.org/OAI/openarchivesprotocol.html#ListMetadataFormats | ListMetadataFormats}
   * request).
   */
  metadata?: NodeListOf<ChildNode>;
  /**
   * An optional and repeatable container to hold data about the metadata part
   * of the record. Two common uses of about containers are:
   *
   * - Rights statements: some repositories may find it desirable to attach terms
   *   of use to the metadata they make available through the OAI-PMH. No
   *   specific set of XML tags for rights expression is defined by OAI-PMH, but
   *   the about container is provided to allow for encapsulating
   *   community-defined rights tags.
   * - Provenance statements: One suggested use of the about container is to
   *   indicate the provenance of a metadata record, e.g. whether it has been
   *   harvested itself and if so from which repository, and when. An XML Schema
   *   for such a provenance container, as well as some supporting information
   *   is available from the accompanying
   *   {@link http://www.openarchives.org/OAI/2.0/guidelines.htm | Implementation Guidelines}
   *   document.
   */
  about?: ParsedXMLElement[];
};
