<script module lang="ts">
  type SVHelper<T> = [
    snippet: Snippet<[param: T, path: string, depth: number]>,
    param: T,
    path: string,
    depth: number,
  ];

  type ReadyForRenderingValue =
    | SVHelper<string>
    | SVHelper<number>
    | SVHelper<boolean>
    | SVHelper<null | undefined>
    | SVHelper<unknown>
    | SVHelper<unknown[]>
    | SVHelper<[key: string, value: unknown][]>
    | SVHelper<NodeListOf<ChildNode>>
    | SVHelper<ParsedXMLElement>;

  const serializer = new XMLSerializer();

  function isWhitespaceOnly(str: string) {
    return /^\s*$/.test(str);
  }

  function serializeNode(value: Node) {
    const serialized = serializer.serializeToString(value);
    return isWhitespaceOnly(serialized) ? "" : serialized;
  }

  function getNodeIfIsNodeListOnlyOneTextNode(nodeList: NodeListOf<ChildNode>) {
    return nodeList.length === 1 &&
      nodeList[0]!.nodeType === nodeList[0]!.TEXT_NODE
      ? serializeNode(nodeList[0]!)
      : null;
  }

  const emptyColor = "#928374";
  const errorColor = "#cc241d";
  const propertyColor = "#689d6a";
  const numberColor = "#d79921";
  const booleanColor = "#b16286";
  const parenthesesColor = "#98971a";
</script>

<script lang="ts">
  import type {
    ParsedXMLAttributes,
    ParsedXMLElement,
  } from "oai-pmh-2-js/index";
  import type { Snippet } from "svelte";
  import { parseElementNode } from "oai-pmh-2-js/parser/xml-parser";
  import RecordComponent from "./record.svelte";

  const { value, xmlPathPattern }: { value: unknown; xmlPathPattern?: RegExp } =
    $props();

  function getValueReadyForRendering(
    value: unknown,
    path = "",
    depth = 0,
  ): ReadyForRenderingValue {
    switch (typeof value) {
      case "string":
        return [stringSnippet, value, path, depth];
      case "number":
        return [numberSnippet, value, path, depth];
      case "boolean":
        return [booleanSnippet, value, path, depth];
      case "undefined":
        return [nullOrUndefinedSnippet, value, path, depth];
      case "object":
        if (value === null) {
          return [nullOrUndefinedSnippet, value, path, depth];
        }

        if (xmlPathPattern?.test(path)) {
          return [
            parsedXmlElementSnippet,
            value as ParsedXMLElement,
            path,
            depth,
          ];
        }

        if (value instanceof NodeList) {
          return [
            nodeListOfChildNodesSnippet,
            value as NodeListOf<ChildNode>,
            path,
            depth,
          ];
        }

        if (Array.isArray(value)) {
          return [arraySnippet, value as unknown[], path, depth];
        }

        const entries = Object.entries(value);
        return [recordSnippet, entries, path, depth];
      default:
        return [unknownSnippet, value, path, depth];
    }
  }

  const [primarySnippet, primaryParam, primaryPath, primaryDepth] = $derived(
    getValueReadyForRendering(value),
  );
</script>

<pre><code
    >{@render primarySnippet(
      // @ts-expect-error: Union of functions intersects their parameters
      primaryParam,
      primaryPath,
      primaryDepth,
    )}</code
  ></pre>

<!-- ------------------- Snippets ------------------- -->

{#snippet stringSnippet(value: string)}
  {#if value.trim() !== ""}
    <span style:white-space="normal">{value}</span>
  {:else}
    <i style:color={emptyColor}>&lt;empty string&gt;</i>
  {/if}
{/snippet}

{#snippet numberSnippet(value: number)}
  <span style:color={numberColor}>{String(value)}</span>
{/snippet}

{#snippet booleanSnippet(value: boolean)}
  <span style:color={booleanColor}>{String(value)}</span>
{/snippet}

{#snippet nullOrUndefinedSnippet(value?: null)}
  <span style:color={emptyColor}
    >{value === null ? String(value) : "<empty>"}</span
  >
{/snippet}

{#snippet arraySnippet(value: unknown[], path: string, depth: number)}
  <RecordComponent list={value} {depth} kind="square-brackets">
    {#snippet inside(listItem, indentationStr, newDepth, i)}
      {@const newPath = `${path}.${i}`}
      {@const [snippet, param] = getValueReadyForRendering(
        listItem,
        newPath,
        newDepth,
      )}

      {indentationStr}{@render snippet(
        // @ts-expect-error: Union of functions intersects their parameters
        param,
        newPath,
        newDepth,
      )}
    {/snippet}
  </RecordComponent>
{/snippet}

{#snippet recordSnippet(
  value: [key: string, value: unknown][],
  path: string,
  depth: number,
)}
  <RecordComponent list={value} {depth} kind="curly-braces">
    {#snippet inside([key, val], indentationStr, newDepth)}
      {@const newPath = `${path}.${key}`}
      {@const [snippet, param] = getValueReadyForRendering(
        val,
        newPath,
        newDepth,
      )}

      {indentationStr}<b style:color={propertyColor}>{key}</b>: {@render snippet(
        // @ts-expect-error: Union of functions intersects their parameters
        param,
        newPath,
        newDepth,
      )}
    {/snippet}
  </RecordComponent>
{/snippet}

{#snippet nodeListOfChildNodesSnippet(
  value: NodeListOf<ChildNode>,
  path: string,
  depth: number,
)}
  {@const nodeAsText = getNodeIfIsNodeListOnlyOneTextNode(value)}
  {#if nodeAsText !== null}
    {@render stringSnippet(nodeAsText)}
  {:else}
    <RecordComponent list={Array.from(value)} {depth} kind="angle-brackets">
      {#snippet inside(childNode, indentationStr, newDepth)}
        {#if childNode.nodeType === childNode.ELEMENT_NODE}
          {indentationStr}{@render parsedXmlElementSnippet(
            parseElementNode(childNode as Element),
            path,
            newDepth,
          )}
        {:else}
          {@const serialized = serializeNode(childNode)}
          {#if serialized}{@render stringSnippet(serialized)}{serialized}{/if}
        {/if}
      {/snippet}
    </RecordComponent>
  {/if}
{/snippet}

{#snippet prefixAndNameSnippet(name: string, prefix?: string)}
  <b style:color={propertyColor}
    >{#if prefix !== undefined}<u style:text-decoration-style="dotted"
        >{prefix}</u
      >:{/if}{name}</b
  >
{/snippet}

{#snippet attributesSnippet(attr: ParsedXMLAttributes, depth: number)}
  <RecordComponent list={Object.entries(attr)} {depth} kind="empty">
    {#snippet inside([name, { prefix, value }], indentationStr)}
      {indentationStr}<small
        >{@render prefixAndNameSnippet(name, prefix)} = {@render stringSnippet(
          value,
        )}</small
      >
    {/snippet}
  </RecordComponent>
{/snippet}

{#snippet prefixAndNameAndAttributes(
  depth: number,
  name: string,
  prefix?: string,
  attr?: ParsedXMLAttributes,
)}
  {#if attr !== undefined}<span style:color={parenthesesColor}>(</span>{/if}<b
    >{@render prefixAndNameSnippet(name, prefix)}</b
  >{#if attr !== undefined}
    {@render attributesSnippet(attr, depth)}<span style:color={parenthesesColor}
      >)</span
    >
  {/if}{": "}
{/snippet}

{#snippet parsedXmlElementSnippet(
  { prefix, name, attr, value }: ParsedXMLElement,
  path: string,
  depth: number,
)}
  {@render prefixAndNameAndAttributes(
    depth,
    name,
    prefix,
    attr,
  )}{#if value !== undefined}
    {@render nodeListOfChildNodesSnippet(value, `${path}.${name}`, depth)}
  {:else}
    <span style:color={emptyColor}>&lt;<i>empty</i>&gt;</span>
  {/if}
{/snippet}

{#snippet unknownSnippet(value: unknown)}
  <i style:color={errorColor}
    >error: unhandled value {String(value)} (type {typeof value})</i
  >
{/snippet}
