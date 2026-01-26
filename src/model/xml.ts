/** Parsed XML attribute values. */
export type ParsedXMLAttributeValue = {
  /** Optional prefix in the name of the attribute. */
  prefix?: string;
  /** Actual string value of the attribute. */
  value: string;
};

/**
 * Parsed XML attributes represented as a record of key and value as
 * {@linkcode ParsedXMLAttributeValue}.
 */
export type ParsedXMLAttributes = Record<string, ParsedXMLAttributeValue>;

/**
 * Parsed XML where there might be text nodes between element nodes. Represents
 * a raw XML structure converted to a JS object.
 */
export type ParsedXMLElement = {
  prefix?: string;
  name: string;
  attr?: ParsedXMLAttributes;
  value: NodeListOf<ChildNode>;
};

/**
 * Simplified parsed XML, where we know there shouldn't be text nodes between
 * element nodes. Used for structured metadata containers.
 */
export type ParsedXMLRecord = Record<string, ParsedXMLElement[]>;
