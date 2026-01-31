/**
 * {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Attr | Attr}
 * representation.
 */
export type ParsedXMLAttributeValue = {
  /** @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Attr/prefix} */
  prefix?: string;
  /** @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Attr/value} */
  value: string;
};

/**
 * XML attributes
 * ({@linkcode https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap | NamedNodeMap})
 * represented as a record. The keys are the attributes'
 * {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Attr/name | name}s.
 */
export type ParsedXMLAttributes = Record<string, ParsedXMLAttributeValue>;

/** A single {@linkcode Element} node representation. */
export type ParsedXMLElement = {
  /** @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/prefix} */
  prefix?: string;
  /** @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/localName} */
  name: string;
  /** @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes} */
  attr?: ParsedXMLAttributes;
  /** @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes} */
  value: NodeListOf<ChildNode>;
};

/**
 * A list of {@linkcode Element} {@linkcode Node}s represented as a record. The
 * keys are the elements'
 * {@linkcode  https://developer.mozilla.org/en-US/docs/Web/API/Element/localName | localName}s.
 */
export type ParsedXMLRecord = Record<string, ParsedXMLElement[]>;

/** The result of parsing a list of {@linkcode Node}s. */
export type XMLParseResult = ParsedXMLRecord | string;
