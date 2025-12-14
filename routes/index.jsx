const HomePage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Professional Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--gray-200)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 var(--space-6)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--primary)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: '700'
            }}>
              C
            </div>
            ClearClause AI
          </div>
          
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)'
          }}>
            <a href="#features" style={{
              color: 'var(--gray-600)',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--gray-600)'}
            >
              Features
            </a>
            <a href="#pricing" style={{
              color: 'var(--gray-600)',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--gray-600)'}
            >
              Pricing
            </a>
            <a href="#about" style={{
              color: 'var(--gray-600)',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--gray-600)'}
            >
              About
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        color: 'white',
        padding: 'var(--space-20) 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: '0.3'
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: '1',
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 var(--space-6)'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: 'var(--space-6)',
            background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Transform Legal Documents with AI Intelligence
          </h1>
          
          <p style={{
            fontSize: '20px',
            fontWeight: '400',
            lineHeight: '1.6',
            marginBottom: 'var(--space-8)',
            opacity: '0.9'
          }}>
            ClearClause AI analyzes complex legal documents in seconds, identifying risks, 
            simplifying clauses, and providing actionable insights for better decision-making.
          </p>
          
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button className="btn btn-lg" style={{
              background: 'white',
              color: 'var(--primary)',
              fontWeight: '600',
              boxShadow: 'var(--shadow-lg)',
              border: 'none'
            }}>
              Start Free Analysis
            </button>
            <button className="btn btn-lg btn-outline" style={{
              borderColor: 'white',
              color: 'white',
              background: 'transparent'
            }}>
              Watch Demo
            </button>
          </div>
          
          <div style={{
            marginTop: 'var(--space-12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-8)',
            flexWrap: 'wrap',
            fontSize: '14px',
            opacity: '0.8'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span>✓</span> No Credit Card Required
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span>✓</span> 99.9% Accuracy
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span>✓</span> Enterprise Security
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section style={{
        padding: 'var(--space-16) 0',
        background: 'var(--gray-50)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 var(--space-6)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-8)',
            border: '1px solid var(--gray-200)',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Live indicator */}
            <div style={{
              position: 'absolute',
              top: 'var(--space-4)',
              right: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--gradient-success)',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              color: 'white',
              fontWeight: '600'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'white',
                animation: 'pulse 2s infinite'
              }} />
              LIVE
            </div>

            <div style={{
              textAlign: 'center',
              marginBottom: 'var(--space-8)'
            }}>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, var(--primary), var(--accent-purple), var(--accent-pink))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: 'var(--space-2)'
              }}>
                Real-Time Global Impact
              </h3>
              <p style={{
                color: 'var(--gray-600)',
                fontSize: '18px'
              }}>
                See the live impact of ClearClause AI across the globe
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-6)'
            }}>
              {[
                { number: '47,832+', label: 'Documents Analyzed', icon: '📄', color: 'var(--gradient-primary)' },
                { number: '1,247', label: 'Active Users', icon: '👥', color: 'var(--gradient-emerald)' },
                { number: '8,934+', label: 'Risks Prevented', icon: '🛡️', color: 'var(--gradient-warning)' },
                { number: '15,672+', label: 'Hours Saved', icon: '⏰', color: 'var(--gradient-purple)' }
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-6)',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--gray-200)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: stat.color,
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-4)',
                    fontSize: '24px',
                    color: 'white',
                    boxShadow: 'var(--shadow-md)'
                  }}>
                    {stat.icon}
                  </div>
                  
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    background: stat.color,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: 'var(--space-2)'
                  }}>
                    {stat.number}
                  </div>
                  
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--gray-600)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: 'var(--space-20) 0',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 var(--space-6)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--space-16)'
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '800',
              color: 'var(--gray-900)',
              marginBottom: 'var(--space-4)'
            }}>
              Powered by Advanced AI Technology
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'var(--gray-600)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Our cutting-edge AI models process legal documents with unprecedented speed and accuracy, 
              giving you the insights you need to make informed decisions.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-8)'
          }}>
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              border: '1px solid var(--gray-200)',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = 'var(--primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'var(--gray-200)'
            }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                fontSize: '24px',
                color: 'white'
              }}>
                🔍
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--gray-900)',
                marginBottom: 'var(--space-3)'
              }}>
                Intelligent Analysis
              </h3>
              <p style={{
                color: 'var(--gray-600)',
                lineHeight: '1.6'
              }}>
                Advanced AI algorithms analyze every clause, identifying potential risks, 
                obligations, and opportunities in your legal documents.
              </p>
            </div>

            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              border: '1px solid var(--gray-200)',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = 'var(--primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'var(--gray-200)'
            }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                fontSize: '24px',
                color: 'white'
              }}>
                ⚡
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--gray-900)',
                marginBottom: 'var(--space-3)'
              }}>
                Lightning Fast
              </h3>
              <p style={{
                color: 'var(--gray-600)',
                lineHeight: '1.6'
              }}>
                Process complex legal documents in seconds, not hours. 
                Get instant insights and recommendations to accelerate your workflow.
              </p>
            </div>

            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              border: '1px solid var(--gray-200)',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = 'var(--primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'var(--gray-200)'
            }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                fontSize: '24px',
                color: 'white'
              }}>
                🛡️
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--gray-900)',
                marginBottom: 'var(--space-3)'
              }}>
                Enterprise Security
              </h3>
              <p style={{
                color: 'var(--gray-600)',
                lineHeight: '1.6'
              }}>
                Bank-grade encryption and security protocols ensure your sensitive 
                legal documents remain completely confidential and protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        padding: 'var(--space-20) 0',
        background: 'var(--gray-50)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 var(--space-6)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--space-16)'
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '800',
              color: 'var(--gray-900)',
              marginBottom: 'var(--space-4)'
            }}>
              Trusted by Legal Professionals Worldwide
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'var(--gray-600)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              See what industry leaders are saying about ClearClause AI
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: 'var(--space-8)'
          }}>
            {[
              {
                quote: "ClearClause AI has revolutionized our contract review process. What used to take hours now takes minutes, with incredible accuracy.",
                author: "Sarah Chen",
                title: "Senior Legal Counsel",
                company: "TechCorp Inc.",
                avatar: "SC",
                color: 'var(--gradient-primary)'
              },
              {
                quote: "The AI's ability to identify hidden risks in complex agreements is remarkable. It's like having a senior partner review every document.",
                author: "Michael Rodriguez",
                title: "Managing Partner",
                company: "Rodriguez & Associates",
                avatar: "MR",
                color: 'var(--gradient-emerald)'
              },
              {
                quote: "Our clients love the simplified explanations. ClearClause AI helps us communicate complex legal concepts in plain English.",
                author: "Emily Watson",
                title: "Contract Specialist",
                company: "Global Legal Solutions",
                avatar: "EW",
                color: 'var(--gradient-purple)'
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-2xl)',
                  padding: 'var(--space-8)',
                  border: '1px solid var(--gray-200)',
                  boxShadow: 'var(--shadow-lg)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                }}
              >
                <div style={{
                  fontSize: '48px',
                  color: 'var(--gray-200)',
                  position: 'absolute',
                  top: 'var(--space-4)',
                  left: 'var(--space-6)'
                }}>
                  "
                </div>
                
                <p style={{
                  fontSize: '16px',
                  color: 'var(--gray-700)',
                  lineHeight: 1.7,
                  marginBottom: 'var(--space-6)',
                  fontStyle: 'italic',
                  paddingTop: 'var(--space-4)'
                }}>
                  {testimonial.quote}
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: testimonial.color,
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '16px'
                  }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: 'var(--gray-900)',
                      marginBottom: '2px'
                    }}>
                      {testimonial.author}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--gray-600)'
                    }}>
                      {testimonial.title} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: 'var(--space-20) 0',
        background: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 var(--space-6)'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '800',
            color: 'var(--gray-900)',
            marginBottom: 'var(--space-4)'
          }}>
            Ready to Transform Your Legal Workflow?
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'var(--gray-600)',
            marginBottom: 'var(--space-8)',
            lineHeight: '1.6'
          }}>
            Join thousands of legal professionals who trust ClearClause AI 
            to analyze their most important documents.
          </p>
          
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-8)'
          }}>
            <button className="btn btn-primary btn-xl">
              Start Free Trial →
            </button>
            <button className="btn btn-outline btn-xl">
              Schedule Demo
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-8)',
            flexWrap: 'wrap',
            fontSize: '14px',
            color: 'var(--gray-500)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
              No setup fees
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
              Cancel anytime
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
              24/7 support
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--gray-900)',
        color: 'white',
        padding: 'var(--space-12) 0',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 var(--space-6)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)',
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: 'var(--space-4)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              C
            </div>
            ClearClause AI
          </div>
          <p style={{
            color: 'var(--gray-400)',
            fontSize: '14px',
            margin: '0'
          }}>
            © 2024 ClearClause AI. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage