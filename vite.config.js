// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Đường dẫn gốc, mặc định là '/'
  build: {
    outDir: 'dist', // Thư mục build (mặc định là 'dist')
  },
});
