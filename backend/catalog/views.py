from rest_framework.decorators import api_view
from rest_framework.response import Response
from musb_backend.mongodb import (
    get_test_categories_collection, get_lab_tests_collection, transform_doc
)


@api_view(['GET'])
def categories_list(request):
    """GET /api/catalog/categories/ — List test categories (from MongoDB)."""
    coll = get_test_categories_collection()
    docs = list(coll.find())
    return Response([transform_doc(d) for d in docs])


@api_view(['GET'])
def tests_list(request):
    """GET /api/catalog/tests/ — List tests with filtering (from MongoDB)."""
    coll = get_lab_tests_collection()
    query = {}

    search = request.query_params.get('search')
    if search:
        query['title'] = {'$regex': search, '$options': 'i'}

    category = request.query_params.get('category')
    if category and category != 'All':
        query['category_name'] = category

    sample_type = request.query_params.get('sample_type')
    if sample_type and sample_type != 'All':
        query['sample_type'] = sample_type

    turnaround = request.query_params.get('turnaround')
    if turnaround and turnaround != 'All':
        query['turnaround'] = turnaround

    max_price = request.query_params.get('max_price')
    if max_price:
        try:
            # Note: stored as string in seed data, but usually better as float in DB.
            # For now matching the seed data structure.
            query['price'] = {'$lte': max_price} 
        except (ValueError, TypeError):
            pass

    docs = list(coll.find(query))
    return Response([transform_doc(d) for d in docs])


@api_view(['GET'])
def test_detail(request, pk):
    """GET /api/catalog/tests/{id}/ — Single test detail (from MongoDB)."""
    coll = get_lab_tests_collection()
    # Note: In seeding script we used numeric 'id' field, but MongoDB uses _id.
    # Our docs have both 'id' (INT) and '_id' (ObjectID).
    # Since the frontend passes 'id', we query by the 'id' field.
    try:
        doc = coll.find_one({'id': int(pk)})
        if doc:
            return Response(transform_doc(doc))
    except (ValueError, TypeError):
        pass
        
    return Response({'error': 'Test not found'}, status=404)
