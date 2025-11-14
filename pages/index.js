// pages/index.js
import Link from 'next/link';
import React from 'react';

export default function Home() {
    return (
        <div>

            <section className="hero text-center">
                <div className="hero-overlay">
                    <div className="container">
                        <h1 className="display-5 fw-bold mb-0">
                            Connecting Neighbors
                        </h1>
                        <h1 className="display-3 mb-3 fw-light text-uppercase">
                            One Job at a Time
                        </h1>
                        <p className="lead mb-4">
                            HireHive helps people find local help — and helps workers find opportunities — with kindness, privacy, and community at heart.
                        </p>
                        <Link href="/signup" className="btn btn-secondary text-dark border-dark btn-lg me-3">Join Now</Link>
                        <br/>
                        <Link href="/job-board" className="">Aleady joined? Proceed to Sign-in</Link>
                    </div>
                </div>
            </section>

            <section className="section text-center">
                <div className="container">
                    <h2 className="fw-bold mb-4">Why HireHive?</h2>
                    <p className="lead mb-5">
                        A buzzing community that brings together people who need help with those who want to lend a hand — without ads, tracking, or corporate nonsense.
                    </p>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <img src="/images/cooperation.png" className="img-fluid feature-img mb-3" alt="People working together" />
                            <h4>Community First</h4>
                            <p>We’re about people helping people — neighbors, friends, and local helpers you can trust.</p>
                        </div>
                        <div className="col-md-4">
                            <img src="/images/payment.png" className="img-fluid feature-img mb-3" alt="Payment for work" />
                            <h4>Fair & Simple</h4>
                            <p>Get paid directly for your work. No fees, no middlemen, no surprises — just honest exchange.</p>
                        </div>
                        <div className="col-md-4">
                            <img src="/images/community.png" className="img-fluid feature-img mb-3" alt="Community garden" />
                            <h4>Open & Free</h4>
                            <p>HireHive is free, open-source, and funded only by donations (coming soon!). Your privacy matters.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section bg-light">
                <div className="container text-center">
                    <h2 className="fw-bold mb-5">What Our Users Say</h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="testimonial">
                                <p>"I found help clearing snow from my driveway the same day I posted! Simple and friendly."</p>
                                <h6 className="mt-3">– Jamie, Homeowner</h6>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="testimonial">
                                <p>"HireHive helped me pick up extra work around my neighborhood. Love that it's community-based!"</p>
                                <h6 className="mt-3">– Alex, Worker</h6>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="testimonial">
                                <p>"Feels like the internet used to — people helping each other. No ads, no tracking."</p>
                                <h6 className="mt-3">– Priya, Volunteer</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section text-center">
                <div className="container">
                    <img src="/images/bees-at-hive.png"
                         className="img-fluid mb-4"
                         style={{ maxWidth: '300px' }}
                         alt="Bees working together" />
                    <h2 className="fw-bold mb-3">Ready to Start Buzzing?</h2>
                    <p className="lead mb-4">Sign up today and join your local hive of helpers!</p>
                    <a href="/signup" className="btn btn-secondary text-dark border-dark btn-lg me-3">Get Started</a>
                    <a href="/job-board" className="btn btn-outline-dark btn-lg">See Jobs</a>
                </div>
            </section>

            <footer className="footer text-center text-white">
                <div className="container">
                    <p className="footer-text mb-1">🐝 HireHive — Community help made simple.</p>
                    <p className="footer-text mb-0 small">Free, open source, and privacy-friendly.</p>
                </div>
            </footer>
        </div>
    );
}

Home.useLayout = false;
