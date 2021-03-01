import { useState, useEffect, useCallback } from "react";
import * as wpIcons from "@wordpress/icons";
import { omit, filter, debounce } from "lodash";
import fuzzysort from "fuzzysort";
import { renderToString } from "react-dom/server";

let allIcons = [];

for (const icon in omit(wpIcons, "Icon")) {
  allIcons.push({
    name: icon,
    svg: wpIcons[icon],
  });
}

function App() {
  const [keyword, setKeyword] = useState("");
  const [icons, setIcons] = useState(allIcons);
  const [activeIcon, setActiveIcon] = useState({});
  const [copied, setCopied] = useState(false);
  const [previewIcon, setPreviewIcon] = useState(allIcons[0]);

  const hideCopied = useCallback(
    debounce(() => setCopied(false), 2000),
    []
  );

  useEffect(() => {
    hideCopied();
  }, [copied]);

  useEffect(() => {
    if (Object.keys(activeIcon).length > 0) {
      setPreviewIcon(activeIcon)
    } else {
      setPreviewIcon(allIcons[0])
    }
  }, [activeIcon]);

  useEffect(() => {
    if (!keyword) {
      setIcons(allIcons);
      return;
    }
    const result = fuzzysort.go(keyword, allIcons, { key: "name" });
    if (!Array.isArray(result)) {
      return;
    }
    setIcons(
      filter(allIcons, (item) =>
        result.map((item) => item.target).includes(item.name)
      )
    );
  }, [keyword]);

  const Icon = ({ icon }) => (
    <button
      className={`p-4 rounded-sm cursor-pointer hover:shadow-lg ${
        icon.name === activeIcon.name && "icon-active"
      }`}
      onClick={() => {
        setActiveIcon(icon);
        navigator.clipboard.writeText(icon.name);
        setCopied(true);
      }}
    >
      <wpIcons.Icon icon={icon.svg} />
    </button>
  );

  return (
    <div className="container max-w-screen-sm px-4 pt-8 mx-auto pb-28">
      <header className="text-center">
        <h1 className="text-5xl font-bold leading-tight">
          Gutenberg Icons Finder
        </h1>
        <p className="mt-4 text-xl leading-normal">
          Just another icon finder for developers building Gutenberg blocks.
        </p>
      </header>

      <div className="relative my-12">
        <input
          className="w-full px-12 py-6 rounded-sm shadow-md"
          type="text"
          placeholder="Search icons..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setActiveIcon({})}
        />
        <wpIcons.Icon
          className="absolute text-gray-500 pointer-events-none fill-current top-5 left-2"
          size="32"
          icon={wpIcons.search}
        />
        <wpIcons.Icon
          className={`absolute p-1 text-gray-700 transform -translate-y-1/2 bg-gray-200 rounded-full cursor-pointer fill-current top-1/2 right-3 ${
            keyword ? "" : "hidden"
          }`}
          size="18"
          icon={wpIcons.close}
          onClick={() => setKeyword("")}
        />
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        {icons.map((icon, index) => (
          <Icon key={index} icon={icon} />
        ))}
        {icons.length === 0 && (
          <p className="w-full text-lg font-bold text-center">Nothing found!</p>
        )}
      </div>

        <h2 className="pt-8 mt-8 mb-4 text-3xl font-bold border-t ">How to use Gutenberg icons in custom blocks?</h2>
      <div className="flex">
        <pre className="w-5/6 p-2 overflow-x-scroll text-sm bg-gray-200 rounded-md">{
`import { Icon, ${previewIcon.name} } from '@wordpress/icons'

<Icon icon={${previewIcon.name}} size={32} /> `
        }</pre>
        <wpIcons.Icon icon={previewIcon.svg} size={32} className="self-center flex-shrink-0 w-1/6"/>
      </div>

      {Object.keys(activeIcon).length > 0 && (
        <div className="fixed w-full max-w-screen-sm px-4 transform -translate-x-1/2 bottom-8 left-1/2">
          <div className="flex items-center justify-between px-4 py-2 font-mono bg-gray-800 rounded-md">
            <span
              onClick={() => {
                navigator.clipboard.writeText(activeIcon.name);
                setCopied(true);
              }}
              className="flex items-center text-sm font-bold text-white"
            >
              {activeIcon.name}
              <small
                style={{
                  fontSize: ".5em",
                  padding: "2px",
                  display: copied ? "block" : "none",
                }}
                className="ml-2 font-thin leading-none text-gray-400 border border-gray-400 rounded-sm"
              >
                COPIED
              </small>
            </span>
            <span className="flex items-center text-white fill-current">
              <wpIcons.Icon icon={activeIcon.svg} />
              <small
                onClick={() => {
                  const blob = new Blob([renderToString(activeIcon.svg)]);
                  const element = document.createElement("a");
                  element.download = `${activeIcon.name}.svg`;
                  element.href = window.URL.createObjectURL(blob);
                  element.click();
                  element.remove();
                }}
                className="flex items-center px-2 py-1 ml-4 text-xs text-green-400 border border-green-500 rounded-md cursor-pointer fill-current "
              >
                <wpIcons.Icon size="16" icon={wpIcons.download} />
                <span className="text-xs font-medium">SVG</span>
              </small>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
