import { defineConfig } from "vite";

export default defineConfig({
	base: "./cube/",
	build: {
		outDir: "dist",
		assetsDir: "assets",
		rollupOptions: {
			output: {
				assetFileNames: (assetInfo) => {
					if (/\.(jpe?g|png|gif|svg|webp)$/.test(assetInfo.name)) {
						return "assets/images/[name]-[hash][extname]";
					}
					return "assets/[name]-[hash][extname]";
				},
			},
		},
	},
});
