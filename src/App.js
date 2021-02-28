import { useState, useEffect } from "react";
import * as wpIcons from "@wordpress/icons";
import { omit, filter } from "lodash";
import fuzzysort from "fuzzysort";

function App() {
  let allIcons = [];

  for (const icon in omit(wpIcons, "Icon")) {
    allIcons.push({
      name: icon,
      svg: wpIcons[icon],
    });
  }

  const [keyword, setKeyword] = useState("");
  const [icons, setIcons] = useState(allIcons);

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

  return (
    <div className="container h-screen max-w-screen-sm px-4 py-8 mx-auto">
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
      </div>
    </div>
  );
}

export default App;

const Icon = ({ icon }) => (
  <button className="p-4 rounded-sm cursor-pointer hover:shadow-lg">
    <wpIcons.Icon icon={icon.svg} />
  </button>
);
