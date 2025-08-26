'use client';

import React, { useEffect, useRef, useState } from 'react';

const TIME_CATEGORIES = [
  'ALL',
  'THIRTY_DAYS',
  'THREE_MONTHS',
  'SIX_MONTHS',
  'MORE_THAN_SIX_MONTHS',
];

const DIFFICULTY_COLORS = {
  Easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Medium:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  Hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function CompanyWiseQuestionsPage() {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [title, setTitle] = useState('');
  const [timeCategory, setTimeCategory] = useState('');
  type Difficulty = 'Easy' | 'Medium' | 'Hard';
  const [companySearch, setCompanySearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
  const [difficulty, setDifficulty] = useState('');
  const [acceptanceMin, setAcceptanceMin] = useState('');
  const [frequencyMin, setFrequencyMin] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const savedCompany = localStorage.getItem('selectedCompany');
    const savedSearch = localStorage.getItem('companySearch');
    if (savedCompany) setSelectedCompany(savedCompany);
    if (savedSearch) setCompanySearch(savedSearch);
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedCompany', selectedCompany);
    localStorage.setItem('companySearch', companySearch);
  }, [selectedCompany, companySearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  // Fetch company suggestions as user types
  useEffect(() => {
    if (!companySearch) {
      setCompanySuggestions([]);
      return;
    }
    const debounce = setTimeout(async () => {
      setCompanySearchLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('action', 'get_companies');
        params.append('search', companySearch);
        const res = await fetch(
          `/api/interview/leetcode/company-wise-questions?${params.toString()}`,
        );
        const data = await res.json();
        // Filter suggestions client-side if needed
        const filtered = (data.companies || []).filter((c: string) =>
          c.toLowerCase().includes(companySearch.toLowerCase()),
        );
        setCompanySuggestions(filtered);
      } catch (e) {
        setCompanySuggestions([]);
      } finally {
        setCompanySearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [companySearch]);

  interface Question {
    id: string;
    title: string;
    difficulty: Difficulty;
    acceptance: number;
    frequency: number;
    timeCategories: string[];
    url: string;
    completed?: boolean;
    completedAt?: string | null;
  }

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch questions only when a company is selected
  useEffect(() => {
    async function fetchQuestions() {
      if (!selectedCompany) {
        setQuestions([]);
        return;
      }

      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCompany) params.append('company', selectedCompany);
      if (title) params.append('title', title);
      if (timeCategory) params.append('timeCategory', timeCategory);
      if (difficulty) params.append('difficulty', difficulty);

      try {
        const res = await fetch(
          `/api/interview/leetcode/company-wise-questions?${params.toString()}`,
        );
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    }

    const debounce = setTimeout(() => {
      fetchQuestions();
    }, 300);

    return () => clearTimeout(debounce);
  }, [selectedCompany, title, timeCategory, difficulty]);

  // Mark question as solved
  async function markSolved(questionId: string) {
    await fetch('/api/interview/leetcode/company-wise-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId }),
    });
  }

  return (
    <div className="container mx-auto py-0 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            className="text-primary drop-shadow"
          >
            <circle
              cx="12"
              cy="12"
              r="12"
              fill="currentColor"
              className="opacity-20"
            />
            <path
              d="M7 12h10M7 16h7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M7 8h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-primary to-blue-600 bg-clip-text text-transparent tracking-tight">
            Company-wise Interview Questions
          </h1>
        </div>
        <p className="text-base text-muted-foreground font-medium">
          Practice, filter, and track your progress on real company LeetCode
          interview questions.
        </p>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-md mb-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-card-foreground">
              Company
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search company..."
              value={companySearch}
              onChange={(e) => {
                setCompanySearch(e.target.value);
                setShowSuggestions(true);
                setSelectedCompany('');
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full px-3 py-1.5 text-sm rounded-md bg-background border border-input text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {showSuggestions && companySearch && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 bg-card border border-border rounded-md mt-1 w-full max-h-36 overflow-auto shadow-lg"
              >
                {companySearchLoading ? (
                  <div className="px-3 py-1.5 text-muted-foreground">
                    Loading...
                  </div>
                ) : companySuggestions.length > 0 ? (
                  <div className="w-full">
                    {companySuggestions.map((c, index) => (
                      <div
                        key={c + index}
                        className="px-3 py-1.5 cursor-pointer hover:bg-muted/30 text-sm"
                        onClick={() => {
                          setSelectedCompany(c);
                          setCompanySearch(c);
                          setShowSuggestions(false);
                        }}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-1.5 text-muted-foreground text-sm">
                    No companies found
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-card-foreground">
              Question Title
            </label>
            <input
              type="text"
              placeholder="Search by title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-md bg-background border border-input text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-card-foreground">
              Time Category
            </label>
            <select
              value={timeCategory}
              onChange={(e) => setTimeCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-md bg-background border border-input text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">All Time Categories</option>
              {TIME_CATEGORIES.map((tc) => (
                <option key={tc} value={tc}>
                  {tc.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-card-foreground">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-md bg-background border border-input text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">All</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedCompany ? (
        <div className="bg-card rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-card-foreground">
            Select a company to get started
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Choose a company from the dropdown to see their interview questions
          </p>
        </div>
      ) : loading ? (
        <div className="bg-card rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg overflow-hidden shadow-md">
          {questions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gradient-to-r from-muted/40 to-muted/10">
                    <th className="text-left px-3 py-4 font-semibold text-base border-b border-border">
                      <span className="inline-flex items-center gap-2">
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="text-primary"
                        >
                          <path
                            d="M4 6h16M4 12h16M4 18h16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        Title
                      </span>
                    </th>
                    <th className="text-center px-4 py-4 font-semibold text-base border-b border-border">
                      <span className="inline-flex items-center gap-2 justify-center">
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="text-yellow-500"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M12 8v4l3 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        Difficulty
                      </span>
                    </th>
                    <th className="text-center px-2 py-4 font-semibold text-base border-b border-border">
                      <span className="inline-flex items-center gap-2 justify-center">
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="text-green-500"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Acceptance
                        <span
                          title="Acceptance rate — % of accepted submissions (accepted / total)"
                          className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-muted/30 text-muted-foreground cursor-help border border-border"
                          aria-label="Acceptance Info"
                        >
                          i
                        </span>
                      </span>
                    </th>
                    <th className="text-center px-2 py-4 font-semibold text-base border-b border-border">
                      <span className="inline-flex items-center gap-2 justify-center">
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="text-blue-500"
                        >
                          <path
                            d="M12 20v-6M6 20v-4M18 20v-2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        Frequency
                        <span
                          title="Frequency — how often this problem appears in interviews (percent)"
                          className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-muted/30 text-muted-foreground cursor-help border border-border"
                          aria-label="Frequency Info"
                        >
                          i
                        </span>
                      </span>
                    </th>
                    <th className="text-center px-2 py-4 font-semibold text-base border-b border-border">
                      <span className="inline-flex items-center gap-2 justify-center">
                        Leetcode Link
                      </span>
                    </th>
                    <th className="text-center px-2 py-4 font-semibold text-base border-b border-border">
                      <span className="inline-flex items-center gap-2 justify-center">
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="text-green-500"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Completed?
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {questions.map((q) => (
                    <tr
                      key={q.id}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-3 py-3 max-w-xs whitespace-nowrap truncate font-medium text-card-foreground">
                        {q.title}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${DIFFICULTY_COLORS[q.difficulty]}`}
                        >
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center text-sm font-mono">
                        {q.acceptance}%
                      </td>
                      <td className="px-2 py-3 text-center text-sm font-mono">
                        {q.frequency}%
                      </td>
                      <td className="px-2 py-3 text-center">
                        <a
                          href={q.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block hover:opacity-80"
                          title="View on LeetCode"
                        >
                          <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAACkUlEQVR4nK2VzU8TQRTA1wC7207bXUA0Rjujgpe2saTcoJ8RFYNH0aAmICqejCcvalL8OGDUA+EifgTtDsH04G6LHjz5F3DQKEGMHgydpcagaEiM2o7ZJku3rWm3ti95p3nz+72Z2ZllmCpjwMWwvT7722YHlz0edjyudn5FuN8DPnIcS7X07QFf6wbv6mKa/G7wQYcDC0tPhMXLdYGHQkxjwAPe6XCrhaUDAced+nXuAe91uIVn6dA+YbJunfd4wJIO53mW3j6zmRIM11QJXacvmcaa4AEPWDTCx0faqIpRPiX4fGmig/u/zt15uIVn6cWBllcEw6gqIUwk9EeXEAnNvYm72Gr4DX4PWDAe6PAB8YGxYCXm3K9itJ5fDZRpnGkwBe9xFcJP94nT/yokMztDREI/DNvVX5Ee9trmjfDRQ0KsXH06BrtVjL4QDNPLs+3OsvDBkH3MCD/X3zxTsSOGYbRDplNdTRULvbutq7pgqFd8wdQ5mrSuNbhzC5+JR5mCr+KZokSSCeXbXEKhJjKTTMgPiwWi3r23A6wXDyYVZdwkPJdJRV4rZmxqFfiMJhDsHL1yss1rHJRl2ZlU5EfJhBw3k4nE08GSPQrutW1crG43WJ2+IIi17HlJDB8UA6KDy+qSiBd8nhptFirNUzE8TGKoz5TkWFC8BKxcTqBluNOWnjjf4igDv6FfNO1OmJIc9TuiBRKvbeXmSKu9BC6hWxvvEUaZZYw6TQlykpD9arHk9f1dW7Wx1NQ2q4rhXSNcjaFTpuEbkqBwzSiZn9zxU8VwgWD43fCSZlMYnq0arsdgRBjb3sZnjwQEDVbwLyAY/qoJrkd61tmuSuieKsFPREK/CYYqkeCTlAR9ZgB/Ac7jlcKnc3teAAAAAElFTkSuQmCC"
                            alt="LeetCode"
                            className="w-5 h-5"
                          />
                        </a>
                      </td>
                      <td className="px-2 py-3 text-center">
                        {q.completed && q.completedAt ? (
                          <span className="inline-flex flex-col items-center text-green-700 dark:text-green-300 text-xs font-semibold">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="mb-1 text-green-600"
                            >
                              <path
                                d="M6 12l4 4 8-8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {new Date(q.completedAt).toLocaleString()}
                          </span>
                        ) : (
                          <div
                            onClick={() => markSolved(q.id)}
                            className="inline-flex items-center justify-center w-7 h-7 border-2 rounded-md cursor-pointer transition-colors border-muted-foreground bg-background hover:border-primary"
                            title="Mark as completed"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="text-muted-foreground"
                            >
                              <path
                                d="M6 12l4 4 8-8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-12">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-card-foreground">
                No questions found
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Try changing your filters or selecting a different company
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
