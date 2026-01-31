import type { ParserHelper } from "./helper/parse-helper.ts";
import type {
  ParsedXMLAttributes,
  ParsedXMLAttributeValue,
  ParsedXMLElement,
  ParsedXMLRecord,
  XMLParseResult,
} from "./model/xml.ts";

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

function parseElementNode(node: Element): ParsedXMLElement {
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

export function parseToRecordOrStringWithHelper(
  childNodeList: NodeListOf<Node>,
  helper?: ParserHelper,
): XMLParseResult {
  let parseResult: XMLParseResult | undefined = undefined;

  for (const childNode of childNodeList) {
    switch (childNode.nodeType) {
      case childNode.ELEMENT_NODE: {
        const parsed = parseElementNode(childNode as Element);

        if (parseResult === undefined || typeof parseResult === "string") {
          parseResult = {};
        }

        // TODO: What if there are multiple different prefixes for the same name?
        (parseResult[parsed.name] ??= []).push(parsed);

        break;
      }
      case childNode.TEXT_NODE:
      case childNode.CDATA_SECTION_NODE: {
        if (typeof parseResult === "object") {
          // ignore text in case we have elements
          break;
        }

        const { data } = childNode as Text | CDATASection;

        if (/\s/.test(data)) {
          // ignore whitespace
          continue;
        }

        // combine with other character data nodes
        parseResult = parseResult === undefined ? data : parseResult + data;

        break;
      }
      case childNode.PROCESSING_INSTRUCTION_NODE:
      case childNode.COMMENT_NODE:
      case childNode.DOCUMENT_TYPE_NODE:
        // ignore
        break;
      default:
        const message = `node type ${childNode.nodeType} not supported/implemented`;
        throw helper !== undefined
          ? helper.getErr(message)
          : new Error(message);
    }
  }

  return parseResult ?? "";
}

/**
 * Parses a
 * {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/NodeList | NodeList}
 * of {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Node | Node}s
 * into either a record structure ({@linkcode ParsedXMLRecord}) or a string.
 *
 * Ignores `PROCESSING_INSTRUCTION_NODE`, `COMMENT_NODE` and
 * `DOCUMENT_TYPE_NODE` nodes, white space
 * {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/CharacterData | CharacterData}
 * nodes, ignores them altogether if there are
 * {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Element | Element}
 * nodes present in the list. Only supports `ELEMENT_NODE`, `TEXT_NODE`,
 * `CDATA_SECTION_NODE`, `PROCESSING_INSTRUCTION_NODE`, `DOCUMENT_TYPE_NODE`,
 * `COMMENT_NODE`. Will throw an error for any other types.
 */
export function parseToRecordOrString(
  childNodeList: NodeListOf<Node>,
): XMLParseResult {
  return parseToRecordOrStringWithHelper(childNodeList);
}

export function getXMLParser(
  domParser: typeof DOMParser,
): (xml: string) => XMLDocument {
  const parser = new domParser();
  // TODO: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#error_handling
  return (xml) => parser.parseFromString(xml, "text/xml");
}
