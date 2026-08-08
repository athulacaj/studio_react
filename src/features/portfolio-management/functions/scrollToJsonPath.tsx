import { RefObject } from "react";

export function scrollToJsonPath(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  path: string
): boolean {
  console.log('json path', path)
  const iframe = iframeRef.current;
  if (!iframe) return false;

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return false;

  const element = doc.querySelector(
    `[data-json-path="${CSS.escape(path)}"]`
  ) as HTMLElement | null;

  if (!element) return false;

  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });

  // Inject highlight style once
  if (!doc.getElementById("json-path-highlight-style")) {
    const style = doc.createElement("style");
    style.id = "json-path-highlight-style";
    style.textContent = `
      @keyframes jsonPathHighlightFade {
        0% {
          outline: 4px solid #facc15;
          background-color: rgba(250, 204, 21, 0.35);
        }
        70% {
          outline: 4px solid #facc15;
          background-color: rgba(250, 204, 21, 0.15);
        }
        100% {
          outline: 0px solid transparent;
          background-color: transparent;
        }
      }

      .json-path-highlight {
        animation: jsonPathHighlightFade 2s ease-out forwards;
      }
    `;
    doc.head.appendChild(style);
  }

  // Restart animation if already applied
  element.classList.remove("json-path-highlight");
  void element.offsetWidth; // Force reflow
  element.classList.add("json-path-highlight");

  // Cleanup class after animation
  setTimeout(() => {
    element.classList.remove("json-path-highlight");
  }, 2000);

  return true;
}