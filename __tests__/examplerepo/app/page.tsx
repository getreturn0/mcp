'use client';

import { useState, useEffect } from 'react';

interface OrderData {
  FirstName: string;
  LastName: string;
  Email: string;
  OrderID: string;
  ProductName: string;
  Quantity: number;
  OrderDate: string;
  DaysSinceOrder: number;
}

interface BalanceData {
  calculations: Array<{
    previousBalance: number;
    change: number;
    newBalance: number;
  }>;
  timestamp: string;
}

export default function Home() {
  const [orderData, setOrderData] = useState<OrderData[]>([]);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [orderError, setOrderError] = useState(false);
  const [balanceError, setBalanceError] = useState(false);
  const [orderLoadTime, setOrderLoadTime] = useState<string>('');
  const [balanceLoadTime, setBalanceLoadTime] = useState<string>('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const loadOrderData = async () => {
    const startTime = performance.now();
    setOrderLoading(true);
    setOrderError(false);

    try {
      const response = await fetch('/api/users/stats');
      const data = await response.json();
      
      const endTime = performance.now();
      const loadTime = ((endTime - startTime) / 1000).toFixed(2);
      setOrderLoadTime(`Last loaded in ${loadTime} seconds`);
      
      if (data.length > 0) {
        setOrderData(data);
      } else {
        setOrderError(true);
      }
    } catch (error) {
      setOrderError(true);
      console.error('Error:', error);
    } finally {
      setOrderLoading(false);
    }
  };

  const loadBalanceData = async (showLoading = true) => {
    const startTime = performance.now();
    if (showLoading) {
      setBalanceLoading(true);
    }
    setBalanceError(false);

    try {
      const response = await fetch('/api/balances');
      const data = await response.json();
      
      const endTime = performance.now();
      const loadTime = ((endTime - startTime) / 1000).toFixed(2);
      setBalanceLoadTime(`Last loaded in ${loadTime} seconds`);
      
      if (data.calculations && data.calculations.length > 0) {
        setBalanceData(data);
      } else {
        setBalanceError(true);
      }
    } catch (error) {
      setBalanceError(true);
      console.error('Error:', error);
    } finally {
      if (showLoading) {
        setBalanceLoading(false);
      }
    }
  };

  useEffect(() => {
    loadOrderData();
    loadBalanceData();
    
    // Set up interval to refresh balance data every second
    const balanceInterval = setInterval(() => loadBalanceData(false), 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(balanceInterval);
  }, []);

  return (
    <>
      <div className="dashboard">
        <div className="header">
          <div>
            <h1>Balance Changes</h1>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Auto-refreshing every second
            </div>
          </div>
          <div className="controls">
            <button onClick={() => loadBalanceData()}>Refresh Balances</button>
            <div className="loading-time">{balanceLoadTime}</div>
          </div>
        </div>
        <div>
          {balanceLoading ? (
            <div className="loading">Loading balance data...</div>
          ) : balanceError ? (
            <div className="error">Error loading balance data</div>
          ) : balanceData ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Previous Balance</th>
                    <th>Change</th>
                    <th>New Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {balanceData.calculations.map((calc, index) => (
                    <tr key={index}>
                      <td>${calc.previousBalance}</td>
                      <td style={{ color: calc.change >= 0 ? 'green' : 'red' }}>
                        {calc.change >= 0 ? '+' : ''}${calc.change}
                      </td>
                      <td>${calc.newBalance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '10px', color: '#666' }}>
                Last updated: {new Date(balanceData.timestamp).toLocaleString()}
              </div>
            </>
          ) : (
            <div className="error">No balance data available</div>
          )}
        </div>
      </div>

      <div className="dashboard" style={{ marginTop: '20px' }}>
        <div className="header">
          <div>
            <h1>Order Analytics Dashboard</h1>
          </div>
          <div className="controls">
            <button onClick={loadOrderData}>Refresh Data</button>
            <div className="loading-time">{orderLoadTime}</div>
          </div>
        </div>
        <div>
          {orderLoading ? (
            <div className="loading">Loading order data...</div>
          ) : orderError ? (
            <div className="error">Error loading order data</div>
          ) : orderData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Order Date</th>
                  <th>Days Since Order</th>
                </tr>
              </thead>
              <tbody>
                {orderData.map((order, index) => (
                  <tr key={index}>
                    <td>{order.FirstName} {order.LastName}</td>
                    <td>{order.Email}</td>
                    <td>{order.OrderID}</td>
                    <td>{order.ProductName}</td>
                    <td>{order.Quantity}</td>
                    <td>{formatDate(order.OrderDate)}</td>
                    <td>{order.DaysSinceOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="error">No order data available</div>
          )}
        </div>
      </div>
    </>
  );
}
