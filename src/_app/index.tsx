import dynamic from "next/dynamic";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ErrorBoundary } from "react-error-boundary";
import { ConfigProvider, theme } from "antd";
import { ErrorPage } from "@pages/error";
import { Layout } from "@widgets/layout";
import { NotificationsProvider } from "@shared/lib/notify";
import { Web3LoadingGuard } from "./Web3LoadingGuard";

export const metadata = {
  title: "JustSmartContracts",
  description: "Your tool to interact with smart contracts",
};

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Head>
      <ErrorBoundary fallback={<ErrorPage />}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm, // 使用 Light 主题
            token: {
              colorBgContainer: "#ffffff",
              colorBgLayout: "#f9f9fb",
            },
          }}
        >
          <Web3LoadingGuard>
            <NotificationsProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </NotificationsProvider>
          </Web3LoadingGuard>
        </ConfigProvider>
      </ErrorBoundary>
    </>
  );
};

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
