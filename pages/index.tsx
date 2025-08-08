import { NextPage } from 'next';
import Head from 'next/head';

const DashboardPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Vikareta Dashboard</title>
        <meta name="description" content="Vikareta Analytics Dashboard" />
      </Head>

      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Vikareta Analytics Dashboard</h1>
        <p>Track your business performance</p>
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <h3>Total Sales</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>₹1,25,000</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <h3>Active Orders</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>42</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
