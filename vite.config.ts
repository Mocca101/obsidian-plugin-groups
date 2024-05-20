import { URL, fileURLToPath } from "node:url";
// import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import builtins from "builtin-modules";
import { defineConfig } from "vite";

const setOutDir = (mode: string) => {
	switch (mode) {
		case "development":
			return "./";
		case "production":
			return "build";
	}
};

export default defineConfig(({ mode }) => {
	return {
		// test: {
		// 	include: ["tests/unit/**/*"]
		// },
		// plugins: [svelte({ preprocess: vitePreprocess() })],
		build: {
			lib: {
				entry: "src/main",
				formats: ["cjs"],
			},
			rollupOptions: {
				output: {
					entryFileNames: "main.js",
					assetFileNames: "styles.css",
					// sourcemapBaseUrl: 'file:/// [Local path to plugin src folder] /test-vault/.obsidian/plugins/obsidian-svelte-plugin/'
				},
				external: [
					"obsidian",
					"electron",
					"@codemirror/autocomplete",
					"@codemirror/collab",
					"@codemirror/commands",
					"@codemirror/language",
					"@codemirror/lint",
					"@codemirror/search",
					"@codemirror/state",
					"@codemirror/view",
					"@lezer/common",
					"@lezer/highlight",
					"@lezer/lr",
					...builtins,
				],
			},
			outDir: setOutDir(mode),
			emptyOutDir: false,
			sourcemap: "inline",
		},
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
				"~": fileURLToPath(new URL(".", import.meta.url)),
			},
		},
	};
});
