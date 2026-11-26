import { AppRouter } from './app/router';
import { ContentProvider } from './hooks/useContent';

export default function App() {
  return (
    <ContentProvider>
      <AppRouter />
    </ContentProvider>
  );
}
