import { ApolloClient, InMemoryCache } from '@apollo/client';
import { getFirestore } from 'firebase/firestore';
import { app } from './firebase';

export const db = getFirestore(app);

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  // We'll be using direct Firestore operations instead of GraphQL
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
}); 