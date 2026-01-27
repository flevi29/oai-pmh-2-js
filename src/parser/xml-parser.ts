import type {
  ParsedXMLAttributes,
  ParsedXMLAttributeValue,
  ParsedXMLElement,
  ParsedXMLRecord,
} from "../model/xml.ts";
import type { ParserHelper } from "./helper/parse-helper.ts";

function getPrefixAndLocalName(
  nodeName: string,
): [prefix: string | undefined, localName: string] {
  const indexOfColon = nodeName.indexOf(":");

  return indexOfColon === -1
    ? [, nodeName]
    : [nodeName.slice(0, indexOfColon), nodeName.slice(indexOfColon + 1)];
}

function parseAttributes(attributes: NamedNodeMap): ParsedXMLAttributes {
  const attr: ParsedXMLAttributes = {};
  for (const attribute of attributes) {
    const { name: combinedName, value } = attribute;
    const [prefix, name] = getPrefixAndLocalName(combinedName);

    const attrValue: ParsedXMLAttributeValue = { value };
    if (prefix !== undefined) {
      attrValue.prefix = prefix;
    }

    attr[name] = attrValue;
  }

  return attr;
}

export function parseElementNode(node: Element): ParsedXMLElement {
  const { nodeName, attributes, childNodes } = node;
  const [prefix, name] = getPrefixAndLocalName(nodeName);

  const parsed: ParsedXMLElement = { name, value: childNodes };

  if (prefix !== undefined) {
    parsed.prefix = prefix;
  }

  if (node.hasAttributes()) {
    parsed.attr = parseAttributes(attributes);
  }

  return parsed;
}

export function parseTextNode(node: Text | CDATASection): string {
  // `nodeValue` of Text or CDATASection cannot be null
  return node.nodeValue!;
}

export const NON_WHITESPACE = /\S/;

export type XMLParseResult = ParsedXMLRecord | string;

// TODO: Open this up
//       Later note: what did I mean?
export function parseToRecordOrString(
  helper: ParserHelper,
  childNodeList: NodeListOf<ChildNode>,
): XMLParseResult {
  let parsedXMLRecord: XMLParseResult | undefined = undefined;

  for (const childNode of childNodeList) {
    switch (childNode.nodeType) {
      case childNode.ELEMENT_NODE: {
        if (typeof parsedXMLRecord === "string") {
          throw helper.getErr(
            "invalid XML for OAI-PMH, non-whitespace Text and Element nodes can not mix",
          );
        }

        const parsed = parseElementNode(childNode as Element);
        // `??=` doesn't seem to be doing type narrowing
        (((parsedXMLRecord ??= {}) as ParsedXMLRecord)[parsed.name] ??=
          []).push(parsed);

        break;
      }
      case childNode.TEXT_NODE:
      case childNode.CDATA_SECTION_NODE: {
        const parsed = parseTextNode(childNode as Text | CDATASection);

        if (!NON_WHITESPACE.test(parsed)) {
          continue;
        }

        if (typeof parsedXMLRecord === "object") {
          throw helper.getErr(
            "invalid XML for OAI-PMH, non-whitespace Text and Element nodes can not mix at this level",
          );
        }

        parsedXMLRecord =
          parsedXMLRecord === undefined ? parsed : parsedXMLRecord + parsed;

        break;
      }
      case childNode.PROCESSING_INSTRUCTION_NODE:
      case childNode.COMMENT_NODE: {
        break;
      }
      default: {
        throw helper.getErr(
          `node type ${childNode.nodeType} not supported/implemented`,
        );
      }
    }
  }

  return parsedXMLRecord ?? "";
}

export type ParseXML = (xml: string) => XMLDocument;

export function getXMLParser(domParser: typeof DOMParser): ParseXML {
  const parser = new domParser();
  // TODO: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#error_handling
  return (xml) => parser.parseFromString(xml, "text/xml");
}
