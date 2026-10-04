"use client";
import { useParams } from 'next/navigation';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function AuditLogsPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [projectId]);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/audit-logs/projects/${projectId}`);
      setLogs(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading audit logs...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Audit Logs</h2>
      
      {logs.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center shadow-sm">
           <p className="text-gray-500">No audit logs found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Version</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {log.actorId?.name || 'System'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold bg-gray-100 border border-gray-200 ${
                       log.action === 'PUBLISH' ? 'text-blue-700 bg-blue-50' : 
                       log.action === 'ROLLBACK' ? 'text-purple-700 bg-purple-50' : 
                       log.action.includes('SAVE') ? 'text-green-700 bg-green-50' : ''
                    }`}>
                       {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     {log.version ? `v${log.version}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <pre className="text-xs text-gray-500 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap bg-gray-50 p-1">
                      {JSON.stringify(log.details)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
