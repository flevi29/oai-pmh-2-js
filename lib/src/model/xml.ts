/// <reference lib="dom.iterable" />

export type ParsedXMLAttributeValue = { prefix?: string; value: string };
export type ParsedXMLAttributes = Record<string, ParsedXMLAttributeValue>;

// Parsed XML where there might be text nodes between element nodes

export type ParsedXMLElement = {
  prefix?: string;
  name: string;
  attr?: ParsedXMLAttributes;
  value: NodeListOf<ChildNode>;
};

// Simplified parsed XML, where we know there shouldn't be text nodes between element nodes

export type ParsedXMLRecord = Record<string, ParsedXMLElement[]>;
