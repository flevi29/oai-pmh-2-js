import { testAllMethodsAndGetInfo } from "./tester.ts";
import { getSemaphore } from "./util/semaphore.ts";

function createUrl(data: unknown) {
  return URL.createObjectURL(
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
}

export async function testUrls() {
  const response = await fetch(new URL("./url-list/ok.jsonl", import.meta.url));

  if (!response.ok) {
    throw new Error(
      `${response.status}: ${response.statusText} ${await response.text()}`,
      { cause: response },
    );
  }

  if (response.body === null) {
    throw new Error("body is null");
  }

  const cors: unknown[] = [];
  const invalidCors: unknown[] = [];

  const semaphore = getSemaphore(5);

  let text = "";
  const decoder = new TextDecoder();
  for await (const chunk of response.body) {
    text += decoder.decode(chunk, { stream: true });
    const idx = text.lastIndexOf("\n");

    for (const unparsedJson of text.slice(0, idx).split("\n")) {
      const json = JSON.parse(unparsedJson) as {
        url: string;
        repositoryName: string;
        accessControlAllowOrigin: string | null;
      };

      if (json.accessControlAllowOrigin?.includes("*")) {
        const releaseLock = await semaphore.acquireLock();
        testAllMethodsAndGetInfo(json.url)
          .then(() => cors.push(json))
          .catch((error) => {
            console.error(error);
            invalidCors.push(json);
          })
          .finally(() => {
            releaseLock();
          });
      } else {
        invalidCors.push(json);
      }
    }

    text = text.slice(idx + 1);
  }

  await semaphore.finish();

  console.log("finished!");

  return [createUrl(cors), createUrl(invalidCors)] as const;
}

const [corsFileUrl, invalidCorsFileUrl] = await testUrls();

function createAnchor(name: string, href: string) {
  const div = document.createElement("div");
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = anchor.innerText = name;
  div.appendChild(anchor);
  document.body.appendChild(div);
}

createAnchor("cors.json", corsFileUrl);
createAnchor("invalid-cors.json", invalidCorsFileUrl);
