from rest_framework.decorators import api_view
from rest_framework.response import Response
from musb_backend.mongodb import get_offers_collection, transform_doc


@api_view(['GET'])
def offers_list(request):
    """GET /api/offers/ — List active offers with optional filtering (from MongoDB)."""
    coll = get_offers_collection()
    query = {}

    offer_type = request.query_params.get('type')
    if offer_type and offer_type != 'All':
        query['offer_type'] = offer_type

    category = request.query_params.get('category')
    if category and category != 'All':
        query['category'] = category

    docs = list(coll.find(query))
    return Response([transform_doc(d) for d in docs])


@api_view(['GET'])
def offer_detail(request, pk):
    """GET /api/offers/{id}/ — Single offer detail (from MongoDB)."""
    coll = get_offers_collection()
    try:
        doc = coll.find_one({'id': int(pk)})
        if doc:
            return Response(transform_doc(doc))
    except (ValueError, TypeError):
        pass
        
    return Response({'error': 'Offer not found'}, status=404)
