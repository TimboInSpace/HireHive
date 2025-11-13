import '../styles/globals.css';
import '../node_modules/leaflet/dist/leaflet.css';
import Layout from '../components/Layout';
import { AuthProvider } from '../context/AuthProvider';

export default function App({ Component, pageProps }) {
    const useLayout = Component.useLayout ?? true;
    return useLayout ? (
        <AuthProvider>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </AuthProvider>
    ) : (
        <Component {...pageProps} />
    );
}

