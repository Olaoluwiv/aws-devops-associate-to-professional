\# AWS QuickSight Sales Performance Dashboard



\## Project Overview



This project demonstrates how to use \*\*Amazon QuickSight\*\* to transform sales data into an interactive Business Intelligence (BI) dashboard.



The goal is to build a practical sales analytics solution that allows a business to monitor:



\- Total Revenue

\- Total Orders

\- Total Profit

\- Monthly Sales Trends

\- Product Performance

\- Regional Sales

\- Sales Representative Performance

\- Customer Trends



The project uses a fictional sales dataset stored in \*\*Amazon S3\*\* and visualizes the data using \*\*Amazon QuickSight\*\*.



\---



\## Business Scenario



Imagine a retail company that has sales data but needs a simple way for management and sales teams to understand business performance.



The company wants to answer questions such as:



\- How much revenue are we generating?

\- Which products generate the most revenue?

\- Which regions perform best?

\- Which sales representatives perform best?

\- How are sales changing month by month?

\- Which customers are purchasing repeatedly?

\- What is our profit performance?



Amazon QuickSight will turn the raw sales data into an interactive dashboard that helps answer these questions.



\---



\## Architecture



```text

&#x20;                 SALES DATA

&#x20;                     |

&#x20;                     v

&#x20;             +---------------+

&#x20;             | Amazon S3      |

&#x20;             | Sales CSV      |

&#x20;             +-------+-------+

&#x20;                     |

&#x20;                     v

&#x20;             +---------------+

&#x20;             | Amazon        |

&#x20;             | QuickSight    |

&#x20;             +-------+-------+

&#x20;                     |

&#x20;            +--------+--------+

&#x20;            |                 |

&#x20;            v                 v

&#x20;      Data Preparation   Calculated Fields

&#x20;            |                 |

&#x20;            +--------+--------+

&#x20;                     |

&#x20;                     v

&#x20;             +---------------+

&#x20;             | BI DASHBOARD  |

&#x20;             |               |

&#x20;             | Revenue       |

&#x20;             | Orders        |

&#x20;             | Profit        |

&#x20;             | Products      |

&#x20;             | Regions       |

&#x20;             | Customers     |

&#x20;             +---------------+

