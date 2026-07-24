"""AIMLAPI integration for the OpenHands app server.

Self-contained package for the AIMLAPI "Get API key" onboarding: the OAuth 2.0
Device Authorization Grant (RFC 8628) against the aimlapi.com agent-auth flow,
plus the partner attribution/endpoint configuration it needs. Kept out of the
host core so the provider preset and this onboarding stay easy to review and
maintain.
"""
