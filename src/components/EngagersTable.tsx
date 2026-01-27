import { useState } from 'react';
import { Search, Filter, Download, ChevronUp, ChevronDown, Eye } from 'lucide-react';

export interface Engager {
  id: number | string;
  username: string;
  score: number;
  intent: 'High' | 'Medium' | 'Low';
  persona: string;
  engagementQuality: number;
  activityLevel: string;
  flags: string[];
}

interface EngagersTableProps {
  engagers: Engager[];
  onSelectUser: (engager: Engager) => void;
}

type SortField = 'username' | 'score' | 'intent' | 'persona' | 'engagementQuality' | 'activityLevel';
type SortDirection = 'asc' | 'desc';

export function EngagersTable({ engagers, onSelectUser }: EngagersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<string>('all');
  const [selectedPersona, setSelectedPersona] = useState<string>('all');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'High': return 'bg-green-100 text-green-700 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  /** Match drawer: same indigo pill style for all personas */
  const personaPillClass = 'px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-300';

  const intentOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
  const activityOrder: Record<string, number> = { 'Very Active': 4, 'Active': 3, 'Moderate': 2, 'Low': 1 };

  const uniquePersonas = Array.from(new Set(engagers.map((e) => e.persona).filter(Boolean))).sort();

  const filteredAndSortedEngagers = engagers
    .filter(engager => {
      const matchesSearch = engager.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIntent = selectedIntent === 'all' || engager.intent === selectedIntent;
      const matchesPersona = selectedPersona === 'all' || engager.persona === selectedPersona;
      return matchesSearch && matchesIntent && matchesPersona;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'username':
          comparison = a.username.localeCompare(b.username);
          break;
        case 'score':
        case 'engagementQuality':
          comparison = a[sortField] - b[sortField];
          break;
        case 'intent':
          comparison = intentOrder[a.intent] - intentOrder[b.intent];
          break;
        case 'activityLevel':
          comparison = (activityOrder[a.activityLevel] ?? 0) - (activityOrder[b.activityLevel] ?? 0);
          break;
        case 'persona':
          comparison = a.persona.localeCompare(b.persona);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleExport = () => {
    const csv = [
      ['Username', 'Score', 'Intent', 'Persona', 'Engagement Quality', 'Activity Level', 'Flags'],
      ...filteredAndSortedEngagers.map(e => [
        e.username,
        e.score,
        e.intent,
        e.persona,
        `${e.engagementQuality}%`,
        e.activityLevel,
        e.flags.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallinst-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={14} className="text-gray-400" />;
    return sortDirection === 'asc' ? 
      <ChevronUp size={14} className="text-indigo-600" /> : 
      <ChevronDown size={14} className="text-indigo-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              showFilters 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-indigo-400'
            }`}
          >
            <Filter size={16} />
            Filter
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
          >
            <Download size={16} />
            Export Leads
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Intent Level</label>
              <select
                value={selectedIntent}
                onChange={(e) => setSelectedIntent(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              >
                <option value="all">All Intents</option>
                <option value="High">High Intent</option>
                <option value="Medium">Medium Intent</option>
                <option value="Low">Low Intent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Persona Type</label>
              <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              >
                <option value="all">All Personas</option>
                {uniquePersonas.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-gray-600 font-medium">
        Showing {filteredAndSortedEngagers.length} of {engagers.length} engagers
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th 
                  className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center gap-2">
                    Username
                    <SortIcon field="username" />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center gap-2">
                    Score
                    <SortIcon field="score" />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('intent')}
                >
                  <div className="flex items-center gap-2">
                    Intent
                    <SortIcon field="intent" />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('persona')}
                >
                  <div className="flex items-center gap-2">
                    Persona
                    <SortIcon field="persona" />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('engagementQuality')}
                >
                  <div className="flex items-center gap-2">
                    Engagement Quality
                    <SortIcon field="engagementQuality" />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('activityLevel')}
                >
                  <div className="flex items-center gap-2">
                    Activity Level
                    <SortIcon field="activityLevel" />
                  </div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase">
                  Flags
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEngagers.map((engager) => (
                <tr 
                  key={engager.id} 
                  className="border-b border-gray-100 hover:bg-indigo-50 transition-colors cursor-pointer"
                  onClick={() => onSelectUser(engager)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {engager.username.substring(1, 3).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{engager.username}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-lg font-bold text-gray-900">{engager.score}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getIntentColor(engager.intent)}`}>
                      {engager.intent}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={personaPillClass}>
                      {engager.persona}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                          style={{ width: `${engager.engagementQuality}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{engager.engagementQuality}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-gray-700">{engager.activityLevel}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {engager.flags.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        engager.flags.map((flag, idx) => (
                          <span key={idx} className="px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                            {flag}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectUser(engager);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
