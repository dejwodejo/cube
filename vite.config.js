import { defineConfig } from "vite";

export default defineConfig({
	base: "/cube/",
	build: {
		outDir: "dist",
		assetsDir: "assets",
		rollupOptions: {
		  output: {
		    chunkFileNames: 'assets/[name]-[hash].js',
		    entryFileNames: 'assets/[name]-[hash].js',
		    assetFileNames: ({ name }) => {
		      if (/\.(jpe?g|png|gif|svg|webp)$/.test(name)) {
		        return 'assets/images/[name]-[hash][extname]';
		      }
		      return 'assets/[name]-[hash][extname]';
		    }
		  }
		}
	},
});
